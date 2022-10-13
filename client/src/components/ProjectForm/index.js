import React, { useState, useRef } from "react";
import { Col, Row, Card, Form, Button } from "react-bootstrap";

import { useMutation } from "@apollo/client";
import { ADD_PROJECT } from "../../utils/mutations";
import { QUERY_PROJECTS, QUERY_ME } from "../../utils/queries";
import Tagify from "@yaireo/tagify";
import Tags from "@yaireo/tagify/dist/react.tagify";
// import TagInput from '../TagInput';
import { useEffect } from "react";

const ProjectForm = () => {

  const titleRef = useRef();
  const bodyRef = useRef();
  const tagsRef = useRef();
  const repoRef = useRef();
  const deployedRef = useRef();

  // displaying project form
  const [displayProjectForm, setDisplayProjectForm] = useState(false);

  const [addProject, { error }] = useMutation(ADD_PROJECT, {
    update(cache, { data: { addProject } }) {
      // could potentially not exist yet, so wrap in a try/catch
      try {
        // update me array's cache
        const { me } = cache.readQuery({ query: QUERY_ME });
        cache.writeQuery({
          query: QUERY_ME,
          data: { me: { ...me, projects: [...me.projects, addProject] } },
        });
      } catch (e) {
        console.warn("First project insertion by user!");
      }

      // update thought array's cache
      const { projects } = cache.readQuery({ query: QUERY_PROJECTS });
      cache.writeQuery({
        query: QUERY_PROJECTS,
        data: { projects: [addProject, ...projects] },
      });
    },
  });

  useEffect(() => {
    const tagifyWhitelist = ["HTML", "CSS", "JavaScript", "Node", "Handlebars", "Express", "MongoDB", "MySQL", "GraphQL", "React", "MERN"];
    const tagifySettings = {
      backspace: "edit",
      // delimiters: ',| ',
      pattern: /^\S{1,20}$/,
      whitelist: tagifyWhitelist,
      dropdown: {
        enabled: 0,
        fuzzySearch: true,
        caseSensitive: false
      },
      maxTags: 10,
      keepInvalid: false,
      editTags: {
        clicks: 1,
        keepInvalid: false
      }
    }
    new Tagify(document.querySelector('input[name="tagify-tags"]'), tagifySettings);
  }, [displayProjectForm]);



  // submit form
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      await addProject({
        variables: {
          projectTitle: titleRef.current.value,
          projectBody: bodyRef.current.value,
          projectTags: JSON.parse(tagsRef.current.value).map(tag => { return tag.value }),
          repoLink: repoRef.current.value,
          deployedLink: deployedRef.current.value,
        },
      });

      // clear form value
      titleRef.current.value = '';
      bodyRef.current.value = '';
      tagsRef.current.value = '';
      repoRef.current.value = '';
      deployedRef.current.value = '';
    } catch (e) {
      console.error(e);
    }
  };

  return (
    // project form card
    <Col>
      <Card className="dark-card-bg text-light shadow mb-4">
        <Card.Body>
          {/* Toggle project form */}
          {!displayProjectForm ? (
            <Button
              variant="primary"
              type="button"
              className="rounded-pill fw-semibold"
              onClick={() => setDisplayProjectForm(!displayProjectForm)}
            >
              <i className="bi bi-plus-lg me-1"></i>
              Create Project
            </Button>
          ) : (
            <Form onSubmit={handleFormSubmit}>
              {/* project title input */}
              <Form.Group className="mb-3" controlId="formProjectTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Title"
                  className="bg-dark text-white"
                  ref={titleRef}
                />
              </Form.Group>

              {/* Look up Tagify or Bootstrap Tags Input to manage tag input field*/}
              {/* project tag input */}
              <Form.Group className="mb-3" controlId="formProjectTags">
                <Form.Control
                  name="tagify-tags"
                  className="bg-dark text-white"
                  placeholder="Tags"
                  ref={tagsRef}
                />
              </Form.Group>

              {/* project description textarea */}
              <Form.Group className="mb-3" controlId="formProjectDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  placeholder="Description"
                  rows={4}
                  className="bg-dark text-white"
                  ref={bodyRef}
                />
              </Form.Group>

              <Row xs={1} md={2}>
                {/* project deployed link input */}
                <Form.Group
                  as={Col}
                  controlId="formDeployedLink"
                  className="mb-3"
                >
                  <Form.Label>Deployed Application Link</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter deployed application link"
                    className="bg-dark text-white"
                    ref={deployedRef}
                    maxLength="100"
                  />
                </Form.Group>
                {/* project repo link input */}
                <Form.Group as={Col} controlId="formRepoLink" className="mb-3">
                  <Form.Label>GitHub Repository Link</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter GitHub repository link"
                    className="bg-dark text-white"
                    ref={repoRef}
                    maxLength="100"
                  />
                </Form.Group>
              </Row>

              <div className="d-flex justify-content-end mt-3">
                {/* submit button */}
                <Button
                  variant="primary"
                  type="submit"
                  size="sm"
                  className="rounded-pill px-3 me-2 fw-semibold"
                >
                  Submit
                </Button>
                {/* cancel button */}
                <Button
                  variant="danger"
                  type="button"
                  size="sm"
                  className="rounded-pill px-3 fw-semibold"
                  onClick={() => setDisplayProjectForm(!displayProjectForm)}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ProjectForm;
