import { useState } from 'react';
import { Link, useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from './ui';
import { Shield, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { signIn, signUp } = useAuth();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        navigate('/dashboard');
      }
    } else {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-slate-900 to-accent-900" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl">TechWith Mahesh</span>
          </Link>
          <div>
            <h1 className="font-display text-4xl font-bold mb-4 leading-tight">
              {isLogin ? 'Welcome back to your command center' : 'Join the future of IT management'}
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-md">
              Manage projects, track installations, monitor service requests, and grow your IT business — all in one place.
            </p>
            <div className="space-y-3">
              {['Real-time project tracking', 'Complete service management', 'Vendor & milestone tracking', 'Analytics dashboard'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-primary-500/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary-400" />
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-400">© 2026 TechWith Mahesh. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-slate-900">TechWith Mahesh</span>
            </Link>
          </div>

          <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="text-slate-500 mb-8">
            {isLogin ? "Enter your credentials to access your dashboard" : 'Get started with your IT management platform'}
          </p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-6 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <Input
                label="Full Name"
                value={fullName}
                onChange={setFullName}
                placeholder="John Doe"
                required
                icon={<User className="w-4 h-4" />}
              />
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
              icon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
              icon={<Lock className="w-4 h-4" />}
            />
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'} className="font-medium text-primary-600 hover:text-primary-700">
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
