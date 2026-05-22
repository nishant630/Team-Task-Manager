import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FolderKanban, Shield, User, Menu, X } from 'lucide-react';
import { Button } from './ui/button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav class="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" class="flex items-center gap-2 group">
          <div class="h-9 w-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg shadow-sm shadow-primary-500/20 group-hover:scale-105 transition-transform">
            T
          </div>
          <span class="font-display font-bold text-xl tracking-tight text-slate-800">
            Task<span class="text-primary-600">Flow</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div class="hidden md:flex items-center gap-8">
          <div class="flex items-center gap-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <LayoutDashboard size={16} />
              Dashboard
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <FolderKanban size={16} />
              Projects
            </NavLink>
          </div>

          <div class="h-6 w-px bg-slate-200"></div>

          {/* User profile dropdown & actions */}
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3">
              <div class="h-8 w-8 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-600">
                <User size={16} />
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-semibold text-slate-700 leading-tight">
                  {user.username}
                </span>
                <span class={`text-[10px] font-bold uppercase tracking-wider mt-0.5 self-start px-2 py-0.5 rounded-full ${
                  user.role === 'admin' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-danger hover:bg-danger-50/50 rounded-lg"
              title="Logout"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div class="flex md:hidden">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant="ghost"
            size="icon"
            className="text-slate-600 hover:text-slate-955 focus:outline-none"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer/Menu */}
      {isOpen && (
        <div class="md:hidden absolute top-full left-0 right-0 w-full bg-white border-b border-slate-250/90 shadow-xl shadow-slate-200/50 px-6 pb-6 pt-4 space-y-4 animate-fadeIn z-40">
          <div class="flex flex-col gap-1.5">
            <NavLink
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <LayoutDashboard size={16} />
              Dashboard
            </NavLink>
            <NavLink
              to="/projects"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <FolderKanban size={16} />
              Projects
            </NavLink>
          </div>

          <div class="border-t border-slate-100 pt-4 flex items-center justify-between px-2">
            <div class="flex items-center gap-3">
              <div class="h-8 w-8 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-600">
                <User size={16} />
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-semibold text-slate-700 leading-tight">
                  {user.username}
                </span>
                <span class={`text-[10px] font-bold uppercase tracking-wider mt-0.5 self-start px-2 py-0.5 rounded-full ${
                  user.role === 'admin' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-danger hover:bg-danger-50/50 rounded-xl text-sm font-medium"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
