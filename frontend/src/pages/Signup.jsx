import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Mail, ShieldAlert, AlertCircle, Users, Check, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const res = await signup(username, email, password, role);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div class="flex-1 flex items-center justify-center p-6 bg-gradient-to-tr from-slate-50 via-slate-100/50 to-primary-50/20">
      <div class="w-full max-w-lg bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-100/40 p-8 space-y-5">
        
        {/* Header */}
        <div class="text-center space-y-2">
          <div class="inline-flex h-11 w-11 bg-primary-600 rounded-2xl items-center justify-center text-white font-display font-bold text-xl shadow-md shadow-primary-500/20 mb-2">
            T
          </div>
          <h2 class="font-display font-bold text-3xl text-slate-800 tracking-tight">
            Create account
          </h2>
          <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Choose your role and register
          </p>
        </div>

        {error && (
          <div class="p-3.5 bg-danger-50 border border-danger-100 text-danger text-xs font-semibold rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} class="space-y-4">
          <div class="grid grid-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Username</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  class="form-input pl-10"
                  required
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  class="form-input pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                class="form-input pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>


          {/* Role Selection Cards */}
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Select Your Role</label>
            <div class="grid grid-2 gap-3">
              {/* Member Card */}
              <div
                onClick={() => setRole('member')}
                class={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                  role === 'member'
                    ? 'border-primary-600 bg-primary-50/20 ring-1 ring-primary-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div class="flex items-center justify-between mb-1">
                  <div class={`p-1.5 rounded-lg ${role === 'member' ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Users size={16} />
                  </div>
                  {role === 'member' && <div class="h-4.5 w-4.5 rounded-full bg-primary-600 flex items-center justify-center text-white"><Check size={10} /></div>}
                </div>
                <span class="text-sm font-semibold text-slate-700">Member</span>
                <span class="text-[10px] text-slate-400 mt-1 leading-normal">Update assigned task status.</span>
              </div>

              {/* Admin Card */}
              <div
                onClick={() => setRole('admin')}
                class={`border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                  role === 'admin'
                    ? 'border-primary-600 bg-primary-50/20 ring-1 ring-primary-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div class="flex items-center justify-between mb-1">
                  <div class={`p-1.5 rounded-lg ${role === 'admin' ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                    <ShieldAlert size={16} />
                  </div>
                  {role === 'admin' && <div class="h-4.5 w-4.5 rounded-full bg-primary-600 flex items-center justify-center text-white"><Check size={10} /></div>}
                </div>
                <span class="text-sm font-semibold text-slate-700">Admin</span>
                <span class="text-[10px] text-slate-400 mt-1 leading-normal">Create projects, manage tasks.</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            class="w-full bg-primary-600 text-white py-3 rounded-lg font-medium text-sm hover:bg-primary-700 active:scale-[0.99] transition-all shadow-md shadow-primary-500/10 disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div class="text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" class="text-primary-600 font-bold hover:underline">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Signup;
