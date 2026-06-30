const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

router.put('/apply/:id', async (req, res) => {
  const { userId } = req.body;

  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.assignedTo) {
      return res.status(400).json({ error: 'Project already assigned' });
    }

    project.assignedTo = userId;
    project.status = 'Assigned';  
    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign project' });
  }
});

module.exports = router;
