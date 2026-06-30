export const applyForProject = async (req, res) => {
  const projectId = req.params.id;
  const { userId } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.assignedTo) {
      return res.status(400).json({ message: 'Project already assigned' });
    }

    project.assignedTo = userId;
    project.status = 'Assigned';

    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
