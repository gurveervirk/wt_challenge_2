// components/Admin.jsx
import React, { useState, useEffect } from 'react';

const Admin = () => {
  const [domains, setDomains] = useState([]);
  const [domain, setDomain] = useState('');
  const [showDomainMessage, setShowDomainMessage] = useState(false);
  const [domainError, setDomainError] = useState('');
  const [projectError, setProjectError] = useState('');
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [project, setProject] = useState({
    domainName: '',  // Corrected property name
    projectName: '',
    description: '',
  });
  const [showProjectMessage, setShowProjectMessage] = useState(false);

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

  const handleAddDomain = async () => {
    try {
      const existingDomain = domains.find((d) => d.name.toLowerCase() === domain.toLowerCase());
      if (existingDomain) {
        setDomainError('Domain already exists');
        setTimeout(() => {
          setDomainError('');
        }, 3000);
        return;
      }
      await fetch('http://localhost:3000/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: domain }),
      });

      fetchDomains();
      setShowDomainMessage(true);

      setTimeout(() => {
        setShowDomainMessage(false);
      }, 3000);

      console.log(`Adding domain: ${domain}`);
    } catch (error) {
      console.error('Error uploading domain:', error);
    }
  };

  const handleUploadProject = () => {
    setShowProjectForm(true);
  };

  const handleProjectFormSubmit = async () => {
    try {
      const existingProjectsResponse = await fetch(`http://localhost:3000/projects/${project.domainName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const existingProjects = await existingProjectsResponse.json();

    // Check if the project name already exists under the selected domain
    const doesProjectExist = existingProjects.some(
      (existingProject) => existingProject.projectName.toLowerCase() === project.projectName.toLowerCase()
    );

    if (doesProjectExist) {
      setProjectError('Project name already exists under this domain');
      setTimeout(() => {
        setProjectError('');
      }, 3000);
      return;
    }

      await fetch('http://localhost:3000/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });

      setShowProjectMessage(true);

      setTimeout(() => {
        setShowProjectMessage(false);
      }, 3000);

      console.log('Submitting project:', project);
      setShowProjectForm(false);
      setProject({
        domainName: '',  // Corrected property name
        projectName: '',
        description: '',
      });
    } catch (error) {
      console.error('Error uploading project:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Add Domain</h2>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={handleAddDomain}>
          Add Domain
        </button>
        {showDomainMessage && (
          <p className="text-success mt-2">{domain} uploaded successfully!</p>
        )}
        {domainError && <p className="text-danger mt-2">{domainError}</p>}
      </div>

      <h2>Upload Project</h2>
      <button
        className="btn btn-success mb-3"
        onClick={handleUploadProject}
      >
        Upload Project
      </button>

      {showProjectForm && (
        <div>
          <h3>Project Form</h3>
          <form>
            <div className="mb-3">
              <label htmlFor="selectDomain" className="form-label">
                Select Domain:
              </label>
              <select
                className="form-select"
                id="selectDomain"
                value={project.domainName}
                onChange={(e) =>
                  setProject({ ...project, domainName: e.target.value })
                }
              >
                {domains.map((uploadedDomain) => (
                  <option key={uploadedDomain._id} value={uploadedDomain.name}>
                    {uploadedDomain.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="projectName" className="form-label">
                Project Name:
              </label>
              <input
                type="text"
                className="form-control"
                id="projectName"
                value={project.projectName}
                onChange={(e) =>
                  setProject({ ...project, projectName: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label htmlFor="projectDescription" className="form-label">
                Project Description:
              </label>
              <textarea
                className="form-control"
                id="projectDescription"
                value={project.description}
                onChange={(e) =>
                  setProject({
                    ...project,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleProjectFormSubmit}
            >
              Submit
            </button>
          </form>
        </div>
      )}
      {showProjectMessage && (
        <p className="text-success mt-3">
          Project uploaded successfully!
        </p>
      )}
      {projectError && <p className="text-danger mt-2">{projectError}</p>}
    </div>
  );
};

export default Admin;
