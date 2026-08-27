import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { COUNTRY_CONFIG, type CountryCode, getCountryConfig } from '../lib/country';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();

  const [step, setStep] = useState(1);
  const [country, setCountry] = useState<CountryCode>('TZ');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [pin, setPin] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const cfg = getCountryConfig(country);

  const sendOTP = async () => {
    clearError();
    setLocalError(null);
    if (!phone.trim()) {
      setLocalError('Phone number is required');
      return;
    }
    try {
      await authService.sendOTP(phone);
      setStep(2);
    } catch (err: any) {
      setLocalError(err.response?.data?.detail || 'Failed to send OTP');
    }
  };

  const verifyOTP = async () => {
    clearError();
    setLocalError(null);
    if (otp.length < 4) {
      setLocalError('Enter the OTP');
      return;
    }
    try {
      await authService.verifyOTP({ phone, otp });
      setStep(3);
    } catch (err: any) {
      setLocalError(err.response?.data?.detail || 'Invalid OTP');
    }
  };

  const submitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!fullName.trim()) {
      setLocalError('Full name is required');
      return;
    }
    if (pin.length < 4) {
      setLocalError('PIN must be at least 4 digits');
      return;
    }

    try {
      await register({
        phone,
        pin,
        country,
        kyc: {
          full_name: fullName,
          national_id: nationalId || undefined,
          date_of_birth: dateOfBirth || undefined,
        },
      });
      navigate('/');
    } catch {
      // error set in context
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Country</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value as CountryCode)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
              >
                {Object.values(COUNTRY_CONFIG).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Phone number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={`${cfg.phonePrefix}7XXXXXXXX`}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
              />
            </div>
            <button
              onClick={sendOTP}
              className="w-full py-3 bg-ocean text-white rounded-xl font-medium hover:bg-ocean/90 transition-colors"
            >
              Send OTP
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
              />
              <p className="text-xs text-text3 mt-1">Demo OTP: 123456</p>
            </div>
            <button
              onClick={verifyOTP}
              className="w-full py-3 bg-ocean text-white rounded-xl font-medium hover:bg-ocean/90 transition-colors"
            >
              Verify OTP
            </button>
          </div>
        );
      case 3:
        return (
          <form onSubmit={submitRegistration} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Wanjiku Mwangi"
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">{cfg.idLabel}</label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder={cfg.idPlaceholder}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Date of birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Set PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-ocean/50"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-ocean text-white rounded-xl font-medium hover:bg-ocean/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Create account
            </button>
          </form>
        );
      default:
        return null;
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

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/login')}
            className="p-2 -ml-2 rounded-lg hover:bg-bg text-text2"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-xl font-bold text-text">Create account</h2>
        </div>

        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full mx-1 ${
                s <= step ? 'bg-ocean' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {(error || localError) && (
          <div className="mb-4 p-3 bg-coral/10 text-coral text-sm rounded-lg">
            {localError || error}
          </div>
        )}

        {renderStep()}
      </div>
    </div>
  );
}
