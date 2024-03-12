// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Domain Schema
const domainSchema = new mongoose.Schema({
  name: String,
});

const Domain = mongoose.model('Domain', domainSchema);

// Define Project Schema
const projectSchema = new mongoose.Schema({
  projectName: String,
  domainName: String,
  description: String,
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Array,
    default: []
  },
});

const Project = mongoose.model('Project', projectSchema);

// CRUD Endpoints for Domain
app.get('/domains', async (req, res) => {
  const domains = await Domain.find();
  res.json(domains);
});

app.post('/domains', async (req, res) => {
    try {
      const existingDomain = await Domain.findOne({ name: req.body.name });
      if (existingDomain) {
        return res.status(400).json({ error: 'Domain already exists' });
      }
  
      const newDomain = new Domain(req.body);
      await newDomain.save();
      res.json(newDomain);
    } catch (error) {
      console.error('Error uploading domain:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// CRUD Endpoints for Project
app.get('/projects/:domain', async (req, res) => {
  const projects = await Project.find({domainName:req.params.domain});
  res.json(projects);
});

app.post('/projects', async (req, res) => {
    try {
      // Check if the project name already exists under the selected domain
      const existingProject = await Project.findOne({
        domainName: req.body.domainName,
        projectName: req.body.projectName,
      });
  
      if (existingProject) {
        return res.status(400).json({ error: 'Project name already exists under this domain' });
      }
  
      const newProject = new Project(req.body);
      await newProject.save();
      res.json(newProject);
    } catch (error) {
      console.error('Error uploading project:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.post('/projects/:projectId/comments', async (req, res) => {
    const { projectId } = req.params;
    const { comment } = req.body;
  
    try {
      const project = await Project.findById(projectId);
  
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
  
      project.comments.unshift(comment);
      await project.save();
  
      res.status(201).json(project);
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/projects/:projectId/likes', async (req, res) => {
    const { projectId } = req.params;
  const { likes } = req.body;

  try {
    // Find the project by ID and update the likes
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $inc: { likes: likes } },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Return the updated project with likes
    res.json({ likes: project.likes });
  } catch (error) {
    console.error('Error updating likes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
