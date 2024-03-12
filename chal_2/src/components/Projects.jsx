// components/Projects.jsx
import React, { useState, useEffect } from 'react';

const Projects = () => {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [domains, setDomains] = useState([]);
  const [projects, setProjects] = useState([]);
  const [likes, setLikes] = useState({});
  const [flags, setFlags] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    // Fetch domains on component mount
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    try {
      const response = await fetch('http://localhost:3000/domains');
      const data = await response.json();
      setDomains(data);
    } catch (error) {
      console.error('Error fetching domains:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`http://localhost:3000/projects/${selectedDomain}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
  
      // Update projects
      setProjects(data);
  
      // Organize comments based on project ID
      const updatedComments = {};
      data.forEach((project) => {
        updatedComments[project._id] = project.comments;
      });

      const updatedLikes = {};
      data.forEach((project) => {
        updatedLikes[project._id] = project.likes;
      });
      
      const updatedFlags = {};
      data.forEach((project) => {
        updatedFlags[project._id] = -1;
      });

      // Update comments
      setComments(updatedComments);
      setLikes(updatedLikes);
      setFlags(updatedFlags);
  
      console.log(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };
  

  const handleDomainChange = (e) => {
    setSelectedDomain(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleExpand = (id) => {
    // Add logic to handle card expansion if needed
    console.log(`Expanding project with ID ${id}`);
  };

  const handleLike = async (projectId) => {
    // Determine the new like value
    const newLikeValue = flags[projectId] === 1 ? -1 : 1;
    setLikes({
      ...likes,
      [projectId]: likes[projectId] + newLikeValue,
    });
  
    try {
      // Update the likes in the local state
      setFlags({
        ...flags,
        [projectId]: newLikeValue,
      });
      
      // Send the new like value to the backend
      const ret = await fetch(`http://localhost:3000/projects/${projectId}/likes`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ likes: newLikeValue }),
        });
        console.log(likes);
        console.log(flags);
        
      console.log(`Liked project with ID ${projectId}. New like value: ${newLikeValue}`);
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };
  
  

  const handleComment = async (projectId) => {
    // Add logic to handle adding a comment to the backend
    try {
      await fetch(`http://localhost:3000/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: newComment }),
      });

      // Update the local state with the new comment
      setComments({
        ...comments,
        [projectId]: comments[projectId]
          ? [newComment, ...comments[projectId]]
          : [newComment],
      });

      // Clear the input field after submitting the comment
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Projects</h2>
      <form onSubmit={handleSubmit} className="mb-3">
        <div className="mb-3">
          <label htmlFor="selectDomain" className="form-label">
            Select Domain:
          </label>
          <select
            className="form-select"
            id="selectDomain"
            value={selectedDomain}
            onChange={handleDomainChange}
          >
            <option value="">-- Select Domain --</option>
            {domains.map((domain) => (
              <option key={domain._id} value={domain.name}>
                {domain.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>

      {selectedDomain && projects.length > 0 && (
        <div className="accordion" id="projectAccordion">
        {projects.map((project) => (
          <div key={project._id} className="accordion-item">
            <h2 className="accordion-header" id={`heading${project._id}`}>
              <button
                className="accordion-button bg-light"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${project._id}`}
                aria-expanded="true"
                aria-controls={`collapse${project._id}`}
              >
                <strong>{project.projectName}</strong>
              </button>
            </h2>
            <div
              id={`collapse${project._id}`}
              className="accordion-collapse collapse"
              aria-labelledby={`heading${project._id}`}
              data-bs-parent="#projectAccordion"
            >
              <div className="accordion-body">
                <p><strong>Description:</strong> {project.description}</p>
                {/* <p><strong>Likes:</strong> {likes[project._id]}</p> */}
                <button
                  className={`btn btn-${flags[project._id] === 1 ? 'danger' : 'primary'}`}
                  onClick={() => handleLike(project._id)}
                >
                  {flags[project._id] === 1 ? 'Dislike' : 'Like'} ({likes[project._id]})
                </button>
                <div className="mt-3">
                  <h6><strong>Comments:</strong></h6>
                  {comments[project._id] &&
                    comments[project._id].map((comment, index) => (
                      <p key={index} className="mb-0">{comment}</p>
                    ))}
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add a comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => handleComment(project._id)}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      )}
    </div>
  );
};

export default Projects;
