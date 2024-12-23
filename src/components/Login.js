// src/components/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../firebase/auth';
import { TextInput } from './ui/TextInput';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'passwordless'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for email link sign-in when component mounts
    const completeSignIn = async () => {
      try {
        const user = await authService.completeSignInWithEmailLink();
        if (user) {
          navigate('/');
        }
      } catch (error) {
        setError('Failed to complete sign in. Please try again.');
      }
    };

    completeSignIn();
  }, [navigate]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.login(formData.email, formData.password);
      navigate('/');
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordlessLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authService.sendSignInLink(formData.email);
      setSuccess('Check your email for the sign-in link!');
      // Clear password field since it's not needed for passwordless
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      setError('Failed to send sign-in link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    try {
      await authService.resetPassword(formData.email);
      setSuccess('Password reset email sent. Check your inbox!');
      setError('');
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white px-8 py-10 rounded-2xl shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-slate-800 mb-2">Welcome back</h1>
            <p className="text-slate-500">Sign in to your account to continue</p>
          </div>

          {/* Toggle between login methods */}
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button
              onClick={() => setLoginMethod('password')}
              className={`flex-1 text-sm font-medium px-4 py-2 rounded-md transition-colors
                ${loginMethod === 'password' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'}`}
            >
              Password Login
            </button>
            <button
              onClick={() => setLoginMethod('passwordless')}
              className={`flex-1 text-sm font-medium px-4 py-2 rounded-md transition-colors
                ${loginMethod === 'passwordless' 
                  ? 'bg-white text-slate-800 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-800'}`}
            >
              Passwordless Login
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form 
            onSubmit={loginMethod === 'password' ? handlePasswordLogin : handlePasswordlessLogin} 
            className="space-y-6"
          >
            <TextInput
              label="Email address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
              required
            />

            {loginMethod === 'password' && (
              <div>
                <TextInput
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
                text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? 'Signing in...' 
                : loginMethod === 'password'
                  ? 'Sign in'
                  : 'Send sign-in link'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;