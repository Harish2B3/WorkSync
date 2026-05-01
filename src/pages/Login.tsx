
import {useState, FormEvent} from 'react';
import {useAuthStore} from '../store/useStore';
import {useNavigate} from 'react-router-dom';
import {authApi} from '../services/api';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';

export function Login() {
  const setUser = useAuthStore(s => s.setUser);
  const setToken = useAuthStore(s => s.setToken);
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Login: user selects role. Signup: always 'member'
  const [loginRole, setLoginRole] = useState('member');
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

  const validate = (): string => {
    if (isSignup && !name.trim()) return 'Full name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!EMAIL_RE.test(email)) return 'Please enter a valid email address.';
    if (!password) return 'Password is required.';
    if (isSignup && password.length < 8) return 'Password must be at least 8 characters.';
    if (!isSignup && password.length < 1) return 'Password is required.';
    return '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        const {token, user} = await authApi.signup(name, email, password, 'member');
        setUser(user);
        setToken(token);
      } else {
        const {token, user} = await authApi.login(email, password, loginRole);
        setUser(user);
        setToken(token);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || (isSignup ? 'Signup failed. Please try again.' : 'Invalid credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setLoginRole('member');
    setIsRoleOpen(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-gray-100 p-10">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6h18M3 12h18M3 18h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">WorkSync</div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900 mb-1">
            {isSignup ? 'Create an Account' : 'Welcome Back'}
          </h1>
          <p className="text-[11px] text-gray-400 text-center leading-tight max-w-[260px]">
            {isSignup
              ? 'Sign up to start managing your work with your team'
              : 'Sign in to access your WorkSync dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-[11px] font-bold text-center bg-red-50 border border-red-100 rounded-xl py-2 px-4">
              {error}
            </div>
          )}

          {/* Role selector — only shown on Login */}
          {!isSignup && (
            <div className="space-y-1.5 relative">
              <label className="text-[12px] font-bold text-gray-500 ml-1">Login as</label>
              <div
                className="w-full border border-gray-200 bg-white px-5 py-3 rounded-full outline-none focus-within:border-black transition-all text-sm text-gray-600 flex items-center justify-between cursor-pointer"
                onClick={() => setIsRoleOpen(!isRoleOpen)}
              >
                <span className="capitalize">{loginRole}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isRoleOpen ? 'rotate-180' : ''}`} />
              </div>

              {isRoleOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                  {['member', 'admin'].map(r => (
                    <div
                      key={r}
                      className={`px-5 py-2.5 text-sm cursor-pointer capitalize transition-colors ${loginRole === r ? 'bg-gray-50 text-black font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
                      onClick={() => { setLoginRole(r); setIsRoleOpen(false); }}
                    >
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Name — only on signup */}
          {isSignup && (
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-500 ml-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full border border-gray-200 bg-white px-5 py-3 rounded-full outline-none focus:border-black transition-all text-sm placeholder:text-gray-300"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-gray-500 ml-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-200 bg-white px-5 py-3 rounded-full outline-none focus:border-black transition-all text-sm placeholder:text-gray-300"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-gray-500 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full border border-gray-200 bg-white px-5 py-3 rounded-full outline-none focus:border-black transition-all text-sm placeholder:text-gray-300 pr-12"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!validate()}
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 rounded-full transition-all text-sm shadow-lg disabled:opacity-50 mt-2"
          >
            {loading ? 'Please wait...' : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-[11px] text-center">
          <span className="text-gray-400 font-medium">{isSignup ? 'Already have an account? ' : "Don't have an account? "}</span>
          <button onClick={switchMode} className="text-gray-900 font-bold hover:underline">
            {isSignup ? 'Sign In' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
