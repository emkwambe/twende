import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const [phone, setPhone] = useState('+255712345678');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!phone.trim()) {
      setLocalError('Phone number is required');
      return;
    }
    if (pin.length < 4) {
      setLocalError('PIN must be at least 4 digits');
      return;
    }

    try {
      await login({ phone, pin });
      navigate('/');
    } catch {
      // error is set in auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-border shadow-lg p-6 sm:p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-ocean flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-ocean">TWENDE</h1>
            <p className="text-[10px] text-text3 tracking-wider">FINANCIAL WELLNESS</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-text text-center mb-2">Welcome back</h2>
        <p className="text-sm text-text2 text-center mb-6">Enter your phone and PIN to continue</p>

        {(error || localError) && (
          <div className="mb-4 p-3 bg-coral/10 text-coral text-sm rounded-lg">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Phone number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+2547XXXXXXXX"
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">PIN</label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text2 hover:text-text"
              >
                {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-ocean text-white rounded-xl font-medium hover:bg-ocean/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text2">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-ocean font-medium hover:underline"
          >
            Create account
          </button>
        </p>

        <p className="mt-4 text-center text-xs text-text3">
          Demo (TZ): {phone} / PIN 1234
        </p>
      </div>
    </div>
  );
}
