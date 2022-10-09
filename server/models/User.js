const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const { Post } = require("./Post");
const { dateFormat } = require("../utils/helpers");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, "Must match an email address!"],
  },
  // passwords must contain a capital, lowercase, number and special character. valid special characters: @$!%*?&.#~&*_-
  // example valid passwords: Password123! passWord?123 123pass-WORD || example invalid passwords: password123 password!123 PASSWORD!123
  password: {
    type: String,
    required: true,
    minlength: 5,
    match: [
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&.#~&*_-])[A-Za-z0-9@$!%*?&.#~&*_-]+$/,
      "Password must contain a capital letter, lowercase letter, a number, and a special character (@$!%*?&.#~&*_-).",
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: (timestamp) => dateFormat(timestamp),
  },
  profileImage: {
    type: String,
    match: [/\.(jpg|jpeg|png|webp|svg)$/, "Must be a valid image link."],
  },
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

userSchema.pre(
  "deleteOne",
  { document: false, query: true },
  async function () {
    await Post.deleteMany({ createdBy: this._id });
  }
);

userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = model("User", userSchema);

module.exports = User;
