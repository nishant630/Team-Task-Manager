import React from 'react';
import { Calendar, User, ArrowUpRight, AlertCircle, Edit, Trash2 } from 'lucide-react';

const TaskCard = ({ task, onOpen, onEdit, onDelete, canEdit }) => {
  const isOverdue = () => {
    if (!task.due_date || task.status === 'done') return false;
    return new Date(task.due_date) < new Date().setHours(0,0,0,0);
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-700 border-slate-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200/60',
    high: 'bg-rose-50 text-rose-700 border-rose-200/60',
  };

  const statusColors = {
    todo: 'bg-slate-100 text-slate-800',
    in_progress: 'bg-sky-50 text-sky-800 border border-sky-100',
    done: 'bg-emerald-50 text-emerald-800 border border-emerald-100',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div class={`glass-card p-5 border flex flex-col justify-between h-full group ${
      isOverdue() ? 'border-danger-200/60 bg-danger-50/5' : 'border-slate-100/80 bg-white'
    }`}>
      <div>
        {/* Header tags */}
        <div class="flex items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-1.5">
            <span class={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              priorityColors[task.priority] || priorityColors.medium
            }`}>
              {task.priority}
            </span>
            <span class={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              statusColors[task.status] || statusColors.todo
            }`}>
              {task.status?.replace('_', ' ')}
            </span>
          </div>

          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canEdit && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                  class="p-1 text-slate-400 hover:text-primary-600 rounded hover:bg-slate-50"
                  title="Edit task"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
                  class="p-1 text-slate-400 hover:text-danger rounded hover:bg-danger-50"
                  title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h4 class="font-display font-bold text-slate-800 group-hover:text-primary-600 transition-colors line-clamp-1 mb-1">
          {task.title}
        </h4>
        <p class="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {task.description || 'No description provided.'}
        </p>
      </div>

      {/* Footer Info */}
      <div class="border-t border-slate-100 pt-4 flex flex-col gap-2 mt-auto">
        <div class="flex items-center justify-between text-[11px] text-slate-400">
          <div class="flex items-center gap-1">
            <Calendar size={12} />
            <span class={isOverdue() ? 'text-danger font-semibold' : ''}>
              {task.due_date ? formatDate(task.due_date) : 'No due date'}
            </span>
            {isOverdue() && <AlertCircle size={12} class="text-danger animate-pulse ml-0.5" />}
          </div>
          
          <div class="flex items-center gap-1">
            <User size={12} />
            <span class="font-medium text-slate-500">
              {task.assigned_to?.username || 'Unassigned'}
            </span>
          </div>
        </div>

        <button 
          onClick={() => onOpen(task)}
          class="w-full mt-2 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-slate-150 text-xs font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50/50 hover:border-primary-100 transition-all"
        >
          Open details <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
