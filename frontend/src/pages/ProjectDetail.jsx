import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Users, 
  Clock, 
  ListTodo,
  CheckCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, todo: 0, in_progress: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState('view'); // 'view', 'create', 'edit'
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/projects/${id}`);
      setProject(res.data.project);
      setTasks(res.data.tasks);

      // Compute stats
      const projectTasks = res.data.tasks;
      const total = projectTasks.length;
      const todo = projectTasks.filter((t) => t.status === 'todo').length;
      const in_progress = projectTasks.filter((t) => t.status === 'in_progress').length;
      const done = projectTasks.filter((t) => t.status === 'done').length;
      
      setStats({ total, todo, in_progress, done });
      setError('');
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError(err.response?.data?.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleOpenTask = (task) => {
    setSelectedTask(task);
    setTaskModalMode('view');
    setIsTaskModalOpen(true);
  };

  const handleCreateTaskOpen = () => {
    setSelectedTask(null);
    setTaskModalMode('create');
    setIsTaskModalOpen(true);
  };

  const handleEditTaskOpen = (task) => {
    setSelectedTask(task);
    setTaskModalMode('edit');
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskModalMode === 'create') {
        // Add project id
        await axios.post('/api/tasks', { ...taskData, project: id });
      } else if (taskModalMode === 'edit') {
        await axios.put(`/api/tasks/${selectedTask._id}`, taskData);
      } else if (taskModalMode === 'view') {
        // Quick status update from view modal
        await axios.put(`/api/tasks/${selectedTask._id}`, taskData);
      }
      fetchProjectDetails();
    } catch (err) {
      console.error('Error saving task:', err);
      throw err;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      fetchProjectDetails();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project and all of its tasks? This action is permanent.')) return;
    try {
      await axios.delete(`/api/projects/${id}`);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  if (loading) {
    return (
      <div class="flex-1 flex items-center justify-center p-6">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div class="flex-1 max-w-2xl mx-auto px-6 py-12 text-center space-y-4">
        <div class="p-4 bg-danger-50 border border-danger-100 text-danger rounded-xl font-medium">
          {error || 'Project not found.'}
        </div>
        <Link to="/dashboard" class="inline-flex items-center gap-1.5 text-primary-600 font-bold hover:underline">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
      </div>
    );
  }

  const isProjectOwner = project.created_by?._id === user?._id;

  // Filter tasks by status for columns
  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div class="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
      
      {/* Header section */}
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div class="space-y-2">
          <Link to="/dashboard" class="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <ArrowLeft size={12} /> Back to dashboard
          </Link>
          <h1 class="font-display font-bold text-4xl text-slate-850 tracking-tight leading-none mb-1.5">
            {project.name}
          </h1>
          <div class="flex flex-wrap items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            <span class="flex items-center gap-1">
              <Clock size={13} />
              Created: {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {project.due_date && (
              <span class={`flex items-center gap-1 ${
                new Date(project.due_date) < new Date().setHours(0,0,0,0) ? 'text-danger' : ''
              }`}>
                <Clock size={13} />
                Due: {new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
          <p class="text-slate-500 text-sm leading-relaxed max-w-2xl">
            {project.description || 'No description provided.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div class="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {isAdmin && (
            <button
              onClick={handleCreateTaskOpen}
              class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-medium text-xs transition-all shadow-md shadow-primary-500/10 flex items-center gap-1.5"
            >
              <Plus size={16} /> New task
            </button>
          )}
          {isProjectOwner && (
            <>
              <button
                onClick={() => navigate(`/projects/${id}/edit`)}
                class="border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl font-medium text-xs transition-all flex items-center gap-1.5"
              >
                <Settings size={16} /> Edit Project
              </button>
              <button
                onClick={handleDeleteProject}
                class="border border-danger-200 bg-rose-50/10 hover:bg-rose-50 text-danger px-4 py-2.5 rounded-xl font-medium text-xs transition-all flex items-center gap-1.5"
              >
                <Trash2 size={16} /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats and Team info */}
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Grid */}
        <div class="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="glass-card p-4 border border-slate-100 bg-white flex items-center gap-3">
            <div class="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500"><HelpCircle size={18} /></div>
            <div>
              <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Total Tasks</span>
              <span class="font-display text-xl font-bold text-slate-700">{stats.total}</span>
            </div>
          </div>
          <div class="glass-card p-4 border border-slate-100 bg-white flex items-center gap-3">
            <div class="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500"><ListTodo size={18} /></div>
            <div>
              <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">To Do</span>
              <span class="font-display text-xl font-bold text-slate-700">{stats.todo}</span>
            </div>
          </div>
          <div class="glass-card p-4 border border-slate-100 bg-white flex items-center gap-3">
            <div class="h-9 w-9 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600"><Clock size={18} /></div>
            <div>
              <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">In Progress</span>
              <span class="font-display text-xl font-bold text-slate-700">{stats.in_progress}</span>
            </div>
          </div>
          <div class="glass-card p-4 border border-slate-100 bg-white flex items-center gap-3">
            <div class="h-9 w-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600"><CheckCircle size={18} /></div>
            <div>
              <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Completed</span>
              <span class="font-display text-xl font-bold text-slate-700">{stats.done}</span>
            </div>
          </div>
        </div>

        {/* Team list */}
        <div class="glass-card p-4 border border-slate-200/50 bg-white space-y-3">
          <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users size={14} /> Team
          </h3>
          <div class="flex flex-wrap gap-1.5">
            <span class="text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-750 px-2 py-0.5 rounded-full" title="Project Owner">
              {project.created_by?.username} (owner)
            </span>
            {project.members?.map((member) => (
              <span key={member._id} class="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {member.username}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Board columns */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Column: To Do */}
        <div class="bg-slate-100/60 border border-slate-200/40 rounded-2xl p-4 flex flex-col gap-4">
          <div class="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <h3 class="font-display font-bold text-slate-700 flex items-center gap-2">
              <span class="h-2 w-2 bg-slate-400 rounded-full"></span>
              To Do
            </h3>
            <span class="text-xs font-semibold bg-slate-200 text-slate-600 h-5 w-5 rounded-full flex items-center justify-center font-mono">
              {todoTasks.length}
            </span>
          </div>
          
          <div class="flex flex-col gap-3 min-h-[250px]">
            {todoTasks.length > 0 ? (
              todoTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onOpen={handleOpenTask}
                  onEdit={handleEditTaskOpen}
                  onDelete={handleDeleteTask}
                  canEdit={isAdmin}
                />
              ))
            ) : (
              <div class="flex-1 flex items-center justify-center p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/30">
                No tasks to do
              </div>
            )}
          </div>
        </div>

        {/* Column: In Progress */}
        <div class="bg-slate-100/60 border border-slate-200/40 rounded-2xl p-4 flex flex-col gap-4">
          <div class="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <h3 class="font-display font-bold text-slate-700 flex items-center gap-2">
              <span class="h-2 w-2 bg-sky-500 rounded-full"></span>
              In Progress
            </h3>
            <span class="text-xs font-semibold bg-slate-200 text-slate-600 h-5 w-5 rounded-full flex items-center justify-center font-mono">
              {inProgressTasks.length}
            </span>
          </div>

          <div class="flex flex-col gap-3 min-h-[250px]">
            {inProgressTasks.length > 0 ? (
              inProgressTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onOpen={handleOpenTask}
                  onEdit={handleEditTaskOpen}
                  onDelete={handleDeleteTask}
                  canEdit={isAdmin}
                />
              ))
            ) : (
              <div class="flex-1 flex items-center justify-center p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/30">
                No tasks in progress
              </div>
            )}
          </div>
        </div>

        {/* Column: Done */}
        <div class="bg-slate-100/60 border border-slate-200/40 rounded-2xl p-4 flex flex-col gap-4">
          <div class="flex items-center justify-between border-b border-slate-200/60 pb-2">
            <h3 class="font-display font-bold text-slate-700 flex items-center gap-2">
              <span class="h-2 w-2 bg-emerald-500 rounded-full"></span>
              Done
            </h3>
            <span class="text-xs font-semibold bg-slate-200 text-slate-600 h-5 w-5 rounded-full flex items-center justify-center font-mono">
              {doneTasks.length}
            </span>
          </div>

          <div class="flex flex-col gap-3 min-h-[250px]">
            {doneTasks.length > 0 ? (
              doneTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onOpen={handleOpenTask}
                  onEdit={handleEditTaskOpen}
                  onDelete={handleDeleteTask}
                  canEdit={isAdmin}
                />
              ))
            ) : (
              <div class="flex-1 flex items-center justify-center p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/30">
                No completed tasks
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Task Modal (view, edit, or create states) */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => { setIsTaskModalOpen(false); setSelectedTask(null); }}
          task={selectedTask}
          mode={taskModalMode}
          projectMembers={project.members ? [project.created_by, ...project.members] : []}
          onSave={handleSaveTask}
        />
      )}

    </div>
  );
};

export default ProjectDetail;
