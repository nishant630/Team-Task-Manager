import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    const res = await login(data.username, data.password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div class="flex-1 flex items-center justify-center p-6 bg-gradient-to-tr from-slate-50 via-slate-100/50 to-primary-50/20">
      <Card class="w-full max-w-md p-8 space-y-6">
        
        {/* Header */}
        <CardHeader class="text-center space-y-2 pb-0">
          <div class="inline-flex h-11 w-11 bg-primary-600 rounded-2xl items-center justify-center text-white font-display font-bold text-xl shadow-md shadow-primary-500/20 mb-2 mx-auto">
            T
          </div>
          <CardTitle class="text-3xl">Welcome back</CardTitle>
          <CardDescription>Sign in to manage your tasks</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div class="p-3.5 bg-danger-50 border border-danger-100 text-danger text-xs font-semibold rounded-lg flex items-center gap-2 mb-4">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Username</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User size={16} />
                </span>
                <Input
                  type="text"
                  placeholder="Enter username"
                  className={`pl-10 ${errors.username ? 'border-danger focus:ring-danger' : ''}`}
                  autoFocus
                  {...register('username', { required: 'Username is required' })}
                />
              </div>
              {errors.username && (
                <span class="text-xs font-medium text-danger-600 mt-1 block flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.username.message}
                </span>
              )}
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={16} />
                </span>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 ${errors.password ? 'border-danger focus:ring-danger' : ''}`}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span class="text-xs font-medium text-danger-600 mt-1 block flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.password.message}
                </span>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>

        {/* Footer */}
        <CardFooter class="text-center justify-center text-xs text-slate-500 pt-4 border-t border-slate-100">
          New to TaskFlow?{' '}
          <Link to="/signup" class="text-primary-600 font-bold hover:underline">
            Create an account
          </Link>
        </CardFooter>

      </Card>
    </div>
  );
};

export default Login;
