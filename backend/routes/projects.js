import express from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Helper to safely get user ID string (handles both populated and unpopulated cases)
const getUserId = (userField) => {
  if (!userField) return '';
  if (userField._id) return userField._id.toString();
  return userField.toString();
};

// Helper to check project membership/creator access
const hasProjectAccess = (user, project) => {
  const userId = user._id.toString();
  const creatorId = getUserId(project.created_by);
  return (
    creatorId === userId ||
    project.members.some((m) => getUserId(m) === userId)
  );
};

// @route   GET api/projects
// @desc    Get all projects user is involved in
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = {
        $or: [
          { created_by: req.user._id },
          { members: req.user._id }
        ]
      };
    } else {
      query = { members: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('created_by', 'username role')
      .populate('members', 'username role')
      .sort({ created_at: -1 });

    // Include task stats for each project
    const projectStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const total = tasks.length;
        const done = tasks.filter((t) => t.status === 'done').length;
        const todo = tasks.filter((t) => t.status === 'todo').length;
        const in_progress = tasks.filter((t) => t.status === 'in_progress').length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdue = tasks.filter(
          (t) => t.status !== 'done' && t.due_date && new Date(t.due_date) < today
        ).length;

        return {
          ...project.toObject(),
          stats: { total, done, todo, in_progress, overdue }
        };
      })
    );

    res.json(projectStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET api/projects/:id
// @desc    Get project details with tasks
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('created_by', 'username role')
      .populate('members', 'username role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check project access
    if (!hasProjectAccess(req.user, project)) {
      return res.status(403).json({ message: 'Access denied to this project' });
    }

    // Fetch tasks
    let taskQuery = { project: project._id };
    // Members only see tasks assigned to them; admins see all
    if (req.user.role !== 'admin') {
      taskQuery.assigned_to = req.user._id;
    }

    const tasks = await Task.find(taskQuery)
      .populate('assigned_to', 'username role')
      .populate('created_by', 'username role')
      .sort({ created_at: -1 });

    res.json({
      project,
      tasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST api/projects
// @desc    Create a project
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { name, description, members, due_date } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      members: members || [],
      due_date: due_date || null,
      created_by: req.user._id
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT api/projects/:id
// @desc    Update a project
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  const { name, description, members, due_date } = req.body;

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the current admin is the owner
    if (project.created_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can edit it' });
    }

    project.name = name || project.name;
    project.description = description !== undefined ? description : project.description;
    project.members = members || project.members;
    project.due_date = due_date !== undefined ? (due_date || null) : project.due_date;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE api/projects/:id
// @desc    Delete a project and its tasks
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if the current admin is the owner
    if (project.created_by.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can delete it' });
    }

    // Delete tasks inside the project
    await Task.deleteMany({ project: project._id });
    // Delete project
    await Project.findByIdAndDelete(project._id);

    res.json({ message: 'Project and all associated tasks deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
