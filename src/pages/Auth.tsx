import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'signup';

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle, user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'login') {
      const { error } = await signInWithEmail(email, password);
      if (error) setError(error);
    } else {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      const { error } = await signUpWithEmail(email, password, fullName);
      if (error) setError(error);
      else setSuccess('Account created! Check your email to confirm, then sign in.');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    await signInWithGoogle();
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
    setSuccess('');
    setFullName('');
    setEmail('');
    setPassword('');
  };

  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 18;

  return (
    <div className={`min-h-screen flex transition-colors duration-700 ${isDay ? 'bg-gray-50' : 'bg-gray-950'}`}>
      {/* Left panel – decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/luxury-kitchen-with-stainless-steel-appliances.jpg"
          alt="Professional kitchen"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-orange-900/40" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-3">
            <img src="/flame-logo-new.png" alt="Flames Up Solutions" className="h-12 object-contain" />
          </Link>
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Your complete<br />kitchen equipment<br />
              <span className="text-orange-400">partner.</span>
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Sign in to manage your quotes, track orders, and access exclusive pricing on commercial kitchen equipment.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { icon: '📋', text: 'View & manage all your quote requests' },
                { icon: '📦', text: 'Track your orders in real time' },
                { icon: '🧾', text: 'Download invoices anytime' },
                { icon: '⚡', text: 'Fast re-order from past purchases' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-200">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Flames Up Solutions. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel – form */}
      <div className={`flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-12 transition-colors duration-700 ${isDay ? 'bg-white' : 'bg-gray-950'}`}>
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link to="/">
            <img src="/flame-logo-new.png" alt="Flames Up Solutions" className="h-14 object-contain mx-auto" />
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Tab toggle */}
          <div className={`flex rounded-xl p-1 mb-8 ${isDay ? 'bg-gray-100' : 'bg-gray-900'}`}>
            {(['login', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === m
                    ? 'bg-orange-600 text-white shadow-sm'
                    : isDay
                    ? 'text-gray-500 hover:text-gray-800'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h1 className={`text-2xl font-bold mb-1 transition-colors duration-700 ${isDay ? 'text-gray-900' : 'text-white'}`}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className={`text-sm transition-colors duration-700 ${isDay ? 'text-gray-500' : 'text-gray-400'}`}>
              {mode === 'login'
                ? 'Sign in to access your dashboard and orders'
                : 'Join Flames Up Solutions for seamless equipment ordering'}
            </p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl border font-medium text-sm mb-5 transition-all hover:shadow-md ${
              isDay
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-gray-900 border-gray-700 text-white hover:bg-gray-800'
            }`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className={`flex-1 h-px ${isDay ? 'bg-gray-200' : 'bg-gray-800'}`} />
            <span className={`text-xs ${isDay ? 'text-gray-400' : 'text-gray-600'}`}>or continue with email</span>
            <div className={`flex-1 h-px ${isDay ? 'bg-gray-200' : 'bg-gray-800'}`} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${isDay ? 'text-gray-700' : 'text-gray-300'}`}>Full Name</label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDay ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                      isDay
                        ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                        : 'bg-gray-900 border-gray-700 text-white placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDay ? 'text-gray-700' : 'text-gray-300'}`}>Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDay ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    isDay
                      ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                      : 'bg-gray-900 border-gray-700 text-white placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`text-sm font-medium ${isDay ? 'text-gray-700' : 'text-gray-300'}`}>Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-orange-500 hover:text-orange-400 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDay ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                  required
                  minLength={6}
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    isDay
                      ? 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                      : 'bg-gray-900 border-gray-700 text-white placeholder-gray-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDay ? 'text-gray-400 hover:text-gray-600' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <span className="text-red-400 text-xs leading-relaxed">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <span className="text-green-400 text-xs leading-relaxed">{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/20"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className={`text-center text-xs mt-6 ${isDay ? 'text-gray-400' : 'text-gray-600'}`}>
            By continuing, you agree to our{' '}
            <span className="text-orange-500 cursor-pointer hover:underline">Terms of Service</span>{' '}
            and{' '}
            <span className="text-orange-500 cursor-pointer hover:underline">Privacy Policy</span>
          </p>

          <div className={`mt-4 text-center text-sm ${isDay ? 'text-gray-500' : 'text-gray-400'}`}>
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => switchMode('signup')} className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => switchMode('login')} className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
                  Sign in
                </button>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link to="/products" className={`inline-flex items-center gap-1.5 text-xs transition-colors ${isDay ? 'text-gray-400 hover:text-orange-500' : 'text-gray-600 hover:text-orange-400'}`}>
              <Flame className="h-3 w-3" />
              Continue browsing without an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
