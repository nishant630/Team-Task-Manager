import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, Plus, ArrowRight, Clock } from 'lucide-react';

const ProjectList = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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
          <h1 class="font-display font-bold text-4xl text-slate-850 tracking-tight leading-none mb-2 flex items-center gap-3">
            <FolderKanban size={34} class="text-primary-500" /> Projects
          </h1>
          <p class="text-slate-500 text-sm font-medium">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} active
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

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project._id} to={`/projects/${project._id}`} class="group">
              <div class="glass-card p-6 border border-slate-200/50 bg-white flex flex-col justify-between h-full hover:-translate-y-0.5 transition-all">
                <div>
                  <h3 class="font-display font-bold text-xl text-slate-850 group-hover:text-primary-600 transition-colors mb-1">
                    {project.name}
                  </h3>
                  
                  <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">
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

                  <p class="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
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
                  <div class="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400 font-medium font-mono">
                    <span class="flex items-center gap-1">
                      <strong class="text-slate-700 font-sans font-semibold">{project.stats.total}</strong> tasks
                    </span>
                    <span class="flex items-center gap-1">
                      <strong class="text-emerald-600 font-sans font-semibold">{project.stats.done}</strong> done
                    </span>
                    {project.stats.overdue > 0 && (
                      <span class="flex items-center gap-1 text-danger">
                        <strong class="text-danger font-sans font-semibold">{project.stats.overdue}</strong> overdue
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div class="border border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400 bg-white/50 max-w-lg mx-auto">
          {isAdmin ? (
            <p class="text-sm">
              No projects yet.{' '}
              <Link to="/projects/new" class="text-primary-600 font-bold hover:underline">
                Create your first project →
              </Link>
            </p>
          ) : (
            <p class="text-sm">You are not a member of any projects yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
