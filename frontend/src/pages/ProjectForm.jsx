import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Users, FolderOpen } from 'lucide-react';

const ProjectForm = () => {
  const { id } = useParams(); // populated if editing
  const isEditMode = !!id;

  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch available users list and project details (if in edit mode)
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Get all users
        const usersRes = await axios.get('/api/auth/users');
        // Filter out current user from selection list
        const filteredUsers = usersRes.data.filter((u) => u._id !== user?._id);
        setAvailableUsers(filteredUsers);

        if (isEditMode) {
          const projectRes = await axios.get(`/api/projects/${id}`);
          const projectData = projectRes.data.project;
          
          // Verify owner
          if (projectData.created_by._id !== user?._id) {
            setError('Access Denied. Only the project creator can edit it.');
            setLoading(false);
            return;
          }

          setName(projectData.name);
          setDescription(projectData.description || '');
          setSelectedMembers(projectData.members.map((m) => m._id));
          setDueDate(projectData.due_date ? projectData.due_date.substring(0, 10) : '');
        }
      } catch (err) {
        console.error('Error loading form data:', err);
        setError('Error loading data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditMode, user]);

  const handleMemberChange = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError('');

    const projectData = {
      name,
      description,
      members: selectedMembers,
      due_date: dueDate || null,
    };

    try {
      if (isEditMode) {
        await axios.put(`/api/projects/${id}`, projectData);
        navigate(`/projects/${id}`);
      } else {
        const res = await axios.post('/api/projects', projectData);
        navigate(`/projects/${res.data._id}`);
      }
    } catch (err) {
      console.error('Error saving project:', err);
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !name) {
    return (
      <div class="flex-1 flex items-center justify-center p-6">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div class="flex-1 max-w-3xl w-full mx-auto px-6 py-8 space-y-6">
      
      {/* Back button */}
      <div>
        <Link 
          to={isEditMode ? `/projects/${id}` : '/dashboard'} 
          class="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-650 text-xs font-semibold uppercase tracking-wider"
        >
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-100/40 p-8 space-y-6">
        {/* Header */}
        <div class="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div class="p-2.5 bg-primary-50 rounded-xl text-primary-600">
            <FolderOpen size={22} />
          </div>
          <div>
            <h1 class="font-display font-bold text-2xl text-slate-800 tracking-tight">
              {isEditMode ? 'Edit Project' : 'New Project'}
            </h1>
            <p class="text-xs text-slate-400 font-medium uppercase tracking-wider mt-0.5">
              Add details and select team members
            </p>
          </div>
        </div>

        {error && (
          <div class="p-3.5 bg-danger-50 border border-danger-100 text-danger text-xs font-semibold rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} class="space-y-6">
          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q1 Roadmap"
              class="form-input"
              required
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              class="form-input min-h-[120px] resize-none"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Due Date (Optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              class="form-input"
            />
          </div>

          {/* Members list checkboxes */}
          <div class="space-y-3">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={14} /> Add Team Members
            </label>
            
            {availableUsers.length > 0 ? (
              <div class="grid grid-2 sm:grid-3 gap-3">
                {availableUsers.map((u) => {
                  const isChecked = selectedMembers.includes(u._id);
                  return (
                    <div
                      key={u._id}
                      onClick={() => handleMemberChange(u._id)}
                      class={`border rounded-xl p-3 flex items-center gap-3 cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'border-primary-600 bg-primary-50/20 ring-1 ring-primary-600'
                          : 'border-slate-200 hover:border-slate-350 bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by click container
                        class="accent-primary-600"
                      />
                      <div class="flex flex-col">
                        <span class="text-xs font-semibold text-slate-700 leading-none">{u.username}</span>
                        <span class="text-[9px] text-slate-400 capitalize mt-1">{u.role}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p class="text-xs text-slate-400 italic">No other registered users available to add.</p>
            )}
          </div>

          {/* Buttons */}
          <div class="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(isEditMode ? `/projects/${id}` : '/dashboard')}
              class="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              class="px-6 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-md shadow-primary-500/10 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default ProjectForm;
