import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { storage } from '../services/storage';
import { User } from '../types';
import { useToast } from './Toast';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: User) => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onSuccess,
  defaultTab = 'login',
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginRemember, setLoginRemember] = useState(true);

  // Register state
  const [regType, setRegType] = useState<'email' | 'phone'>('email');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!loginIdentifier.trim()) {
      newErrors.loginIdentifier = 'Email or phone number is required.';
    }
    if (!loginPassword) {
      newErrors.loginPassword = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const res = storage.login(loginIdentifier, loginPassword);
    setIsSubmitting(false);

    if (res.success && res.user) {
      showToast('success', 'Authentication Successful', res.message);
      onSuccess(res.user);
    } else {
      setErrors({ form: res.message });
      showToast('error', 'Login Failed', res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!regFullName.trim()) {
      newErrors.regFullName = 'Full name is required.';
    }

    if (regType === 'email') {
      if (!regEmail.trim()) {
        newErrors.regEmail = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim())) {
        newErrors.regEmail = 'Please enter a valid email address.';
      }
    } else {
      if (!regPhone.trim()) {
        newErrors.regPhone = 'Phone number is required.';
      } else if (regPhone.replace(/\D/g, '').length < 7) {
        newErrors.regPhone = 'Please enter a valid phone number with area code.';
      }
    }

    if (!regPassword) {
      newErrors.regPassword = 'Password is required.';
    } else if (regPassword.length < 8) {
      newErrors.regPassword = 'Password must be at least 8 characters.';
    }

    if (regPassword !== regConfirmPassword) {
      newErrors.regConfirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const identifier = regType === 'email' ? regEmail.trim() : regPhone.trim();
    const res = storage.register({
      fullName: regFullName.trim(),
      identifier,
      password: regPassword,
      company: regCompany.trim(),
    });
    setIsSubmitting(false);

    if (res.success && res.user) {
      showToast('success', 'Account Registered', res.message);
      onSuccess(res.user);
    } else {
      setErrors({ form: res.message });
      showToast('error', 'Registration Failed', res.message);
    }
  };

  const fillDemoAccount = () => {
    setLoginIdentifier('alex.wright@apexenterprise.com');
    setLoginPassword('Password123!');
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Brand Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 text-center relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-white mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">ContactHub Enterprise</h2>
          <p className="text-xs text-slate-300 mt-1">
            Enterprise Directory & Contact Management System
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrors({});
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrors({});
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'register'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Self-Register
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errors.form && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          {activeTab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address or Phone Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => {
                      setLoginIdentifier(e.target.value);
                      if (errors.loginIdentifier) setErrors((prev) => ({ ...prev, loginIdentifier: '' }));
                    }}
                    placeholder="alex.wright@apexenterprise.com or +1 415..."
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                      errors.loginIdentifier ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.loginIdentifier && (
                  <p className="mt-1 text-xs text-rose-600">{errors.loginIdentifier}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={fillDemoAccount}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                  >
                    Use Demo Credentials
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (errors.loginPassword) setErrors((prev) => ({ ...prev, loginPassword: '' }));
                    }}
                    placeholder="Enter account password"
                    className={`w-full pl-9 pr-10 py-2 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                      errors.loginPassword ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.loginPassword && (
                  <p className="mt-1 text-xs text-rose-600">{errors.loginPassword}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={loginRemember}
                    onChange={(e) => setLoginRemember(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>Remember this device</span>
                </label>
                <span className="text-slate-400">Demo pwd: Password123!</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 mt-2"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Directory'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Registration Method Picker */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Register Using
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegType('email')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      regType === 'email'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Address</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegType('phone')}
                    className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      regType === 'phone'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Phone Number</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                {errors.regFullName && (
                  <p className="mt-1 text-xs text-rose-600">{errors.regFullName}</p>
                )}
              </div>

              {/* Identifier based on selection */}
              {regType === 'email' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Corporate Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="eleanor.vance@company.com"
                      className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  {errors.regEmail && (
                    <p className="mt-1 text-xs text-rose-600">{errors.regEmail}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Mobile Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  {errors.regPhone && (
                    <p className="mt-1 text-xs text-rose-600">{errors.regPhone}</p>
                  )}
                </div>
              )}

              {/* Company (Optional) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    placeholder="e.g. Apex Enterprise Solutions"
                    className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {errors.regPassword && (
                    <p className="mt-1 text-xs text-rose-600">{errors.regPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  {errors.regConfirmPassword && (
                    <p className="mt-1 text-xs text-rose-600">{errors.regConfirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="text-slate-600 hover:text-slate-900 text-xs flex items-center gap-1"
                >
                  {showRegPassword ? 'Hide Passwords' : 'Show Passwords'}
                </button>
                <span>Encrypted via BCrypt</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 mt-2"
              >
                <span>{isSubmitting ? 'Registering Account...' : 'Complete Self-Registration'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
