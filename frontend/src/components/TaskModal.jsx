import React, { useState, useEffect } from 'react';
import { X, Calendar, User, AlignLeft, Info, HelpCircle, Save } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const TaskModal = ({ isOpen, onClose, task, mode = 'view', projectMembers = [], onSave }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Initialize form fields for create/edit/view
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setAssignedTo(task.assigned_to?._id || task.assigned_to || '');
      setPriority(task.priority || 'medium');
      setStatus(task.status || 'todo');
      setDueDate(task.due_date ? task.due_date.substring(0, 10) : '');
    } else {
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setPriority('medium');
      setStatus('todo');
      setDueDate('');
    }
    setError('');
  }, [task, mode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'view') return;

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setSubmitting(true);
    setError('');

    const taskData = {
      title,
      description,
      assigned_to: assignedTo || null,
      priority,
      due_date: dueDate || null,
      status,
    };

    try {
      await onSave(taskData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusUpdate = async () => {
    setSubmitting(true);
    setError('');
    try {
      await onSave({ status });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const priorityColors = {
    low: 'text-slate-500 bg-slate-100',
    medium: 'text-amber-700 bg-amber-50',
    high: 'text-rose-700 bg-rose-50',
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh] z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 class="font-display font-bold text-lg text-slate-800">
            {mode === 'create' && 'New Task'}
            {mode === 'edit' && 'Edit Task'}
            {mode === 'view' && 'Task Details'}
          </h3>
          <button onClick={onClose} class="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-150 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div class="p-3 bg-danger-50 border border-danger-100 text-danger text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          {mode === 'view' ? (
            // VIEW MODE
            <div class="space-y-6">
              <div>
                <span class={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block mb-2 ${
                  priorityColors[task.priority] || priorityColors.medium
                }`}>
                  {task.priority} Priority
                </span>
                <h2 class="font-display font-bold text-2xl text-slate-850 tracking-tight leading-snug">
                  {task.title}
                </h2>
              </div>

              {/* Description */}
              <div class="space-y-2">
                <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlignLeft size={14} /> Description
                </h4>
                <div class="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 border border-slate-100 leading-relaxed whitespace-pre-wrap">
                  {task.description || 'No description provided.'}
                </div>
              </div>

              {/* Details grid */}
              <div class="grid grid-2 gap-4 border-t border-slate-100 pt-5 text-sm">
                <div class="flex items-center gap-3">
                  <div class="h-9 w-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                    <User size={16} />
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Assigned To</span>
                    <span class="font-medium text-slate-700">{task.assigned_to?.username || 'Unassigned'}</span>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="h-9 w-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Due Date</span>
                    <span class="font-medium text-slate-700">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'}
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="h-9 w-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                    <HelpCircle size={16} />
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Created By</span>
                    <span class="font-medium text-slate-700">{task.created_by?.username}</span>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <div class="h-9 w-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                    <Info size={16} />
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">Status</span>
                    <span class="capitalize font-medium text-slate-700">{task.status?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div class="border-t border-slate-100 pt-5 space-y-3">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Quick Status Update
                </label>
                <div class="flex gap-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    class="form-input flex-1"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <button
                    onClick={handleQuickStatusUpdate}
                    disabled={submitting}
                    class="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save size={16} />
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // FORM MODE (CREATE/EDIT)
            <form onSubmit={handleSubmit} class="space-y-4">
              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Task Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  class="form-input"
                  required
                />
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add some details..."
                  class="form-input min-h-[100px] resize-none"
                />
              </div>

              <div class="grid grid-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Assignee</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    class="form-input"
                  >
                    <option value="">Unassigned</option>
                    {projectMembers.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.username}
                      </option>
                    ))}
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    class="form-input"
                  />
                </div>
              </div>

              <div class="grid grid-2 gap-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    class="form-input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    class="form-input"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  class="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  class="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
