import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import TaskModal from '../components/TaskModal';
import { 
  FolderKanban, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Plus, 
  ListTodo, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    projectsCount: 0,
    tasksCount: 0,
    completedCount: 0,
    overdueCount: 0,
  });
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projRes, taskRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/tasks')
      ]);

      const fetchedProjects = projRes.data;
      const fetchedTasks = taskRes.data;

      setProjects(fetchedProjects);
      setTasks(fetchedTasks);

      // Compute stats
      const totalProjects = fetchedProjects.length;
      const totalTasks = fetchedTasks.length;
      const completed = fetchedTasks.filter((t) => t.status === 'done').length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const overdue = fetchedTasks.filter(
        (t) => t.status !== 'done' && t.due_date && new Date(t.due_date) < today
      );

      setOverdueTasks(overdue);

      setStats({
        projectsCount: totalProjects,
        tasksCount: totalTasks,
        completedCount: completed,
        overdueCount: overdue.length
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenTask = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTaskStatus = async (statusData) => {
    if (!selectedTask) return;
    try {
      await axios.put(`/api/tasks/${selectedTask._id}`, statusData);
      // Refresh dashboard
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating task status:', err);
      throw err;
    }
  };

  // Calculate chart metrics
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;

  const lowPriorityCount = tasks.filter((t) => t.priority === 'low').length;
  const mediumPriorityCount = tasks.filter((t) => t.priority === 'medium').length;
  const highPriorityCount = tasks.filter((t) => t.priority === 'high').length;

  const statusChartData = {
    labels: ['To Do', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [todoCount, inProgressCount, doneCount],
        backgroundColor: [
          'rgba(148, 163, 184, 0.85)',
          'rgba(56, 189, 248, 0.85)',
          'rgba(16, 185, 129, 0.85)',
        ],
        borderColor: [
          'rgb(148, 163, 184)',
          'rgb(56, 189, 248)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const priorityChartData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        label: 'Tasks',
        data: [lowPriorityCount, mediumPriorityCount, highPriorityCount],
        backgroundColor: [
          'rgba(148, 163, 184, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(244, 63, 94, 0.85)',
        ],
        borderColor: [
          'rgb(148, 163, 184)',
          'rgb(245, 158, 11)',
          'rgb(244, 63, 94)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: 'Outfit, sans-serif',
            size: 11,
            weight: '500',
          },
          color: '#64748b',
          padding: 15,
        },
      },
    },
  };

  const priorityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            family: 'Outfit, sans-serif',
            size: 10,
          },
          color: '#64748b',
        },
        grid: {
          color: 'rgba(241, 245, 249, 0.8)',
        },
      },
      x: {
        ticks: {
          font: {
            family: 'Outfit, sans-serif',
            size: 11,
            weight: '600',
          },
          color: '#64748b',
        },
        grid: {
          display: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <div class="flex-1 flex items-center justify-center p-6">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div class="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
      
      {/* Header */}
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 class="font-display font-bold text-4xl text-slate-850 tracking-tight leading-none mb-2">
            Hey, {user?.username}.
          </h1>
          <p class="text-slate-500 text-sm font-medium">
            {isAdmin ? 'Admin overview of all your projects.' : 'Your tasks and projects.'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => navigate('/projects/new')}
            class="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md shadow-primary-500/10 flex items-center gap-2 self-start md:self-auto"
          >
            <Plus size={16} /> New project
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Projects" value={stats.projectsCount} icon={FolderKanban} type="primary" />
        <StatCard title="My Tasks" value={stats.tasksCount} icon={ListTodo} />
        <StatCard title="Completed" value={stats.completedCount} icon={CheckSquare} type="success" />
        <StatCard title="Overdue" value={stats.overdueCount} icon={Clock} type={stats.overdueCount > 0 ? 'danger' : 'default'} />
      </div>

      {/* Analytics Charts */}
      {tasks.length > 0 && (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="glass-card p-6 border border-slate-200/50 bg-white">
            <h3 class="font-display font-bold text-slate-800 text-base mb-4">Task Status Distribution</h3>
            <div class="h-64 relative">
              <Doughnut data={statusChartData} options={statusChartOptions} />
            </div>
          </div>
          <div class="glass-card p-6 border border-slate-200/50 bg-white">
            <h3 class="font-display font-bold text-slate-800 text-base mb-4">Task Priority Breakdown</h3>
            <div class="h-64 relative">
              <Bar data={priorityChartData} options={priorityChartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Overdue Warning Section */}
      {overdueTasks.length > 0 && (
        <div class="space-y-3">
          <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle size={14} class="text-danger animate-bounce" /> Overdue Tasks
          </h2>
          <div class="space-y-2">
            {overdueTasks.map((task) => (
              <div 
                key={task._id} 
                onClick={() => handleOpenTask(task)}
                class="glass-card p-4 border border-danger-100 bg-danger-50/5 flex items-center justify-between gap-4 cursor-pointer hover:border-danger-300 hover:bg-danger-50/10 transition-all duration-200"
              >
                <div>
                  <h4 class="font-semibold text-slate-800 text-sm mb-0.5">{task.title}</h4>
                  <div class="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <span>{task.project?.name}</span>
                    <span class="h-1 w-1 bg-slate-300 rounded-full"></span>
                    <span class="text-danger font-semibold uppercase tracking-wider bg-danger-50 border border-danger-100 px-2 py-0.5 rounded">
                      Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <button class="text-xs text-slate-400 font-medium group flex items-center gap-1 hover:text-slate-700">
                  Open <ArrowRight size={12} class="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Sections Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Projects Section */}
        <div class="lg:col-span-2 space-y-4">
          <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FolderKanban size={14} /> Your Projects
          </h2>
          {projects.length > 0 ? (
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {projects.map((project) => (
                <Link key={project._id} to={`/projects/${project._id}`} class="group">
                  <div class="glass-card p-6 border border-slate-200/50 bg-white flex flex-col justify-between h-full hover:-translate-y-0.5 transition-all">
                    <div>
                      <h3 class="font-display font-bold text-lg text-slate-800 group-hover:text-primary-600 transition-colors mb-1">
                        {project.name}
                      </h3>
                      <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                        {project.due_date ? (
                          <span class={`flex items-center gap-1 ${
                            new Date(project.due_date) < new Date().setHours(0,0,0,0) ? 'text-danger' : ''
                          }`}>
                            <Clock size={11} />
                            Due: {new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        ) : (
                          <span class="flex items-center gap-1">
                            <Clock size={11} />
                            Created: {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {project.description || 'No description provided.'}
                      </p>

                      {/* Team / Assigned Members */}
                      {project.members && project.members.length > 0 && (
                        <div class="flex items-center gap-1.5 mb-4 flex-wrap">
                          <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Assigned to:</span>
                          {project.members.slice(0, 3).map((m) => (
                            <span key={m._id} class="text-[9px] font-semibold text-slate-650 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/30">
                              {m.username}
                            </span>
                          ))}
                          {project.members.length > 3 && (
                            <span class="text-[9px] font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100/50">
                              +{project.members.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Project Stats */}
                    {project.stats && (
                      <div class="border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] text-slate-400 font-medium font-mono">
                        <span class="flex items-center gap-1">
                          <strong class="text-xs text-slate-700 font-sans font-semibold">{project.stats.total}</strong> tasks
                        </span>
                        <span class="flex items-center gap-1">
                          <strong class="text-xs text-emerald-600 font-sans font-semibold">{project.stats.done}</strong> done
                        </span>
                        {project.stats.overdue > 0 && (
                          <span class="flex items-center gap-1 text-danger">
                            <strong class="text-xs text-danger font-sans font-semibold">{project.stats.overdue}</strong> overdue
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div class="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 bg-white/50">
              {isAdmin ? (
                <p class="text-sm">
                  No projects yet.{' '}
                  <Link to="/projects/new" class="text-primary-600 font-bold hover:underline">
                    Create your first project →
                  </Link>
                </p>
              ) : (
                <p class="text-sm">You are not a member of any projects yet. Contact your Administrator.</p>
              )}
            </div>
          )}
        </div>

        {/* Assigned Tasks Section */}
        <div class="space-y-4">
          <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={14} /> Assigned to You
          </h2>
          {tasks.length > 0 ? (
            <div class="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div 
                  key={task._id} 
                  onClick={() => handleOpenTask(task)}
                  class="glass-card p-4 border border-slate-200/50 bg-white hover:border-slate-350 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 transition-all"
                >
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <span class={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      task.priority === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.priority}
                    </span>
                    <span class="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                      {task.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 class="font-bold text-slate-800 text-sm line-clamp-1 mb-1">{task.title}</h4>
                  <div class="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100/50 text-[10px] text-slate-400 font-medium">
                    <span>{task.project?.name || 'No Project'}</span>
                    {task.due_date && (
                      <span class={`flex items-center gap-1 ${
                        task.status !== 'done' && new Date(task.due_date) < new Date().setHours(0,0,0,0)
                          ? 'text-danger font-semibold'
                          : ''
                      }`}>
                        <Clock size={10} />
                        {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {tasks.length > 5 && (
                <p class="text-center text-[11px] text-slate-400 font-medium pt-2">
                  Showing 5 of {tasks.length} tasks
                </p>
              )}
            </div>
          ) : (
            <div class="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 bg-white/50 text-sm">
              No tasks assigned to you.
            </div>
          )}
        </div>

      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedTask(null); }}
          task={selectedTask}
          mode="view"
          onSave={handleSaveTaskStatus}
        />
      )}

    </div>
  );
};

export default Dashboard;
