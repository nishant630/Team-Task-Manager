import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to safely get user ID string (handles both populated and unpopulated cases)
const getUserId = (userField) => {
  if (!userField) return '';
  if (userField._id) return userField._id.toString();
  return userField.toString();
};

// @route   GET api/tasks
// @desc    Get all tasks assigned to or managed by the user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      // Find projects managed by/involving the admin
      const projects = await Project.find({
        $or: [
          { created_by: req.user._id },
          { members: req.user._id }
        ]
      });
      const projectIds = projects.map((p) => p._id);
      query = { project: { $in: projectIds } };
    } else {
      // Members only see tasks assigned to them
      query = { assigned_to: req.user._id };
    }

    const tasks = await Task.find(query)
      .populate('project', 'name description')
      .populate('assigned_to', 'username role')
      .populate('created_by', 'username role')
      .sort({ created_at: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET api/tasks/:id
// @desc    Get task detail
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project')
      .populate('assigned_to', 'username role')
      .populate('created_by', 'username role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = task.project;
    // Check if user has access to project
    const isOwner = getUserId(project.created_by) === req.user._id.toString();
    const isMember = project.members.some((m) => getUserId(m) === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Members can only view their own tasks inside a project
    if (req.user.role !== 'admin' && task.assigned_to && task.assigned_to._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST api/tasks
// @desc    Create a task
// @access  Private
router.post('/', protect, async (req, res) => {
  const { project: projectId, title, description, assigned_to, priority, due_date, status } = req.body;

  try {
    // Only admins can create tasks
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create tasks' });
    }

    if (!projectId || !title) {
      return res.status(400).json({ message: 'Project and Title are required' });
    }

    // Check project exists and creator owns it
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (getUserId(project.created_by) !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project creator can add tasks' });
    }

    // Validate assignee is part of project (member or owner)
    if (assigned_to) {
      const isMember = project.members.some((m) => getUserId(m) === assigned_to.toString());
      const isOwner = getUserId(project.created_by) === assigned_to.toString();
      if (!isMember && !isOwner) {
        return res.status(400).json({ message: 'Assigned user is not part of this project' });
      }
    }

    const task = await Task.create({
      project: projectId,
      title,
      description,
      assigned_to: assigned_to || null,
      priority: priority || 'medium',
      due_date: due_date || null,
      status: status || 'todo',
      created_by: req.user._id
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assigned_to', 'username role')
      .populate('created_by', 'username role');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task (Admins full update; Members update status only)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { title, description, assigned_to, priority, due_date, status } = req.body;

  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = task.project;

    if (req.user.role === 'admin') {
      // Admins: must be project owner to update
      if (getUserId(project.created_by) !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Only the project owner can update this task' });
      }

      // Validate new assignee if changing
      if (assigned_to && getUserId(assigned_to) !== getUserId(task.assigned_to)) {
        const isMember = project.members.some((m) => getUserId(m) === assigned_to.toString());
        const isOwner = getUserId(project.created_by) === assigned_to.toString();
        if (!isMember && !isOwner) {
          return res.status(400).json({ message: 'Assigned user is not part of this project' });
        }
      }

      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.assigned_to = assigned_to !== undefined ? (assigned_to || null) : task.assigned_to;
      task.priority = priority || task.priority;
      task.due_date = due_date !== undefined ? (due_date || null) : task.due_date;
      task.status = status || task.status;

    } else {
      // Members: can only update status
      if (task.assigned_to && task.assigned_to.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }

      // Check if trying to edit other fields
      if (title || description || assigned_to || priority || due_date) {
        return res.status(403).json({ message: 'Members can only update task status' });
      }

      task.status = status || task.status;
    }

    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id)
      .populate('assigned_to', 'username role')
      .populate('created_by', 'username role');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = task.project;

    // Only admins who own the project can delete tasks
    if (req.user.role !== 'admin' || getUserId(project.created_by) !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can delete tasks' });
    }

    await Task.findByIdAndDelete(task._id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
