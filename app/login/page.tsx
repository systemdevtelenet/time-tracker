'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { logUserLogin } from '@/lib/activityLogs';

function LoginFullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-[#272626] flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-200">
      <div className="flex flex-col items-center text-center max-w-md space-y-4">
        {/* Animated Modern Ring Spinner in brand blue #3678B0 */}
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-[3px] border-slate-100 dark:border-[#434142]" />
          <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-[3px] border-transparent border-t-[#2F6798] dark:border-t-[#3678B0] animate-spin" />
        </div>
        {/* Loading Text & Subtitle */}
        <div className="space-y-1.5">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F8F8F6] tracking-tight font-sans">
            Loading Dashboard Data...
          </h2>
          <p className="text-xs text-slate-400 dark:text-[#94A3B8] font-normal leading-relaxed">
            Retrieving operational metrics and executive KPIs
          </p>
        </div>
      </div>
    </div>
  );
}

const AUTHORIZED_DOMAINS = [
  '@cebutelenet.com',
  '@cebutele-net.com',
  '@cebutele-net.ph',
  '.telenet@gmail.com',
  'telenet@gmail.com',
  '@gmail.com',
];

function isAuthorizedDomain(email: string): boolean {
  const lower = email.toLowerCase().trim();
  return AUTHORIZED_DOMAINS.some((domain) => lower.endsWith(domain));
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Storage Image URLs from Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhdmsmwrskxowvytedgh.supabase.co';
  const bgImageUrl = `${supabaseUrl}/storage/v1/object/public/Images/ctnp-bg-image-1.png`;
  const logoUrl = `${supabaseUrl}/storage/v1/object/public/Images/ctnp-logo-full.png`;

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Field-specific & General Errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Rate Limiting & Lockout State (persisted in localStorage)
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  // Logout Toast
  const [showLogoutToast, setShowLogoutToast] = useState(false);

  // Check URL parameters for OAuth errors and logout
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const logoutParam = searchParams.get('logout');

    if (errorParam === 'unauthorized_domain') {
      setEmailError('Access denied: Please sign in using your official company Google account (*.telenet@gmail.com or @cebutelenet.com).');
    } else if (errorParam === 'not_authorized') {
      setEmailError('Access denied: Your account has not been added by an administrator or granted system access.');
    }

    if (logoutParam === 'true') {
      setShowLogoutToast(true);
      const timer = setTimeout(() => {
        setShowLogoutToast(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Check initial remembered email and lockout state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('ctnp_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }

      const storedAttempts = parseInt(localStorage.getItem('ctnp_login_failed_attempts') || '0', 10);
      setFailedAttempts(storedAttempts);

      const lockoutUntil = parseInt(localStorage.getItem('ctnp_lockout_until') || '0', 10);
      const now = Date.now();
      if (lockoutUntil > now) {
        const remaining = Math.ceil((lockoutUntil - now) / 1000);
        setLockoutSeconds(remaining);
      }
    }
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('ctnp_lockout_until');
            localStorage.setItem('ctnp_login_failed_attempts', '0');
          }
          setFailedAttempts(0);
          setGeneralError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Handle client-side pre-submission validations
  const validateForm = useCallback((): boolean => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    const trimmedEmail = email.trim();

    // 1. Required Email Check
    if (!trimmedEmail) {
      setEmailError('Email address is required.');
      isValid = false;
    } else {
      // 2. Email Format / Syntax Regex Check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError('Please enter a valid email address.');
        isValid = false;
      } else if (!isAuthorizedDomain(trimmedEmail)) {
        // 3. Company Domain Restriction
        setEmailError('Unauthorized domain. Please use your official company email.');
        isValid = false;
      }
    }

    // 4. Required Password Check
    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    return isValid;
  }, [email, password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutSeconds > 0) {
      setGeneralError(`Too many failed attempts. Locked out for 60 seconds. (${lockoutSeconds}s remaining)`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setGeneralError(null);
    setEmailError(null);
    setPasswordError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (typeof window !== 'undefined') {
          localStorage.setItem('ctnp_login_failed_attempts', nextAttempts.toString());
        }

        if (nextAttempts >= 5) {
          const lockoutTime = Date.now() + 60000;
          if (typeof window !== 'undefined') {
            localStorage.setItem('ctnp_lockout_until', lockoutTime.toString());
          }
          setLockoutSeconds(60);
          setGeneralError('Too many failed attempts. Locked out for 60 seconds. (60s remaining)');
        } else {
          // Exact validation style from user reference: Red border on input + red text below field
          setPasswordError('Password does not match employee identification code.');
        }

        setIsLoading(false);
        return;
      }

      // Successful Database Verification -> Authenticate Supabase client session
      try {
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
      } catch (authClientErr) {
        console.warn('Supabase client auth sign in warning:', authClientErr);
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('ctnp_login_failed_attempts');
        localStorage.removeItem('ctnp_lockout_until');

        if (data.user) {
          localStorage.setItem('ctnp_current_user', JSON.stringify(data.user));
        }

        localStorage.setItem('tele_active_tab', 'dashboard');

        if (rememberMe) {
          localStorage.setItem('ctnp_remembered_email', email.trim());
        } else {
          localStorage.removeItem('ctnp_remembered_email');
        }

        logUserLogin(email.trim(), 'System Auth');
      }

      setIsRedirecting(true);
      router.push('/?tab=dashboard');
    } catch (err: unknown) {
      console.error('Login exception:', err);
      setPasswordError('Password does not match employee identification code.');
      setIsLoading(false);
      setIsRedirecting(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (lockoutSeconds > 0) return;

    setIsGoogleLoading(true);
    setGeneralError(null);
    setEmailError(null);
    setPasswordError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });

      if (error) {
        setEmailError(error.message || 'Failed to initiate Google sign-in.');
        setIsGoogleLoading(false);
      }
    } catch (err: unknown) {
      console.error('Google login error:', err);
      setEmailError('Failed to initiate Google sign-in.');
      setIsGoogleLoading(false);
    }
  };

  const isLockedOut = lockoutSeconds > 0;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0f16] overflow-hidden select-none">
      
      {/* Full Page Loading Overlay when Logging In */}
      {isRedirecting && <LoginFullScreenLoader />}
      
      {/* Background Graphic from Supabase Storage */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0 scale-105 transform transition-transform duration-1000"
        style={{
          backgroundImage: `url("${bgImageUrl}")`,
        }}
      />

      {/* Soft 50% Dark Overlay for optimal card focus */}
      <div className="absolute inset-0 bg-black/50 z-0" />

      {/* Logout Floating Toast Notification with 3.5s countdown bar */}
      {showLogoutToast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl bg-white shadow-2xl border border-slate-200 text-slate-800 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="pr-4">
              <p className="font-bold text-slate-900 text-xs">Logged Out</p>
              <p className="text-[11px] text-slate-500">You have been signed out successfully.</p>
            </div>
            <button
              onClick={() => setShowLogoutToast(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            {/* 3.5s Animated Countdown Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
              <div 
                className="h-full bg-emerald-500 transition-all duration-[3500ms] ease-linear w-0" 
                style={{ width: '100%', animation: 'countdown 3.5s linear forwards' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Login Card Modal Container (Max Width: 768px / max-w-3xl, Min Height: 425px, Rounded-2xl, Shadow-2xl) */}
      <div className="relative z-10 w-full max-w-3xl min-h-[425px] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-full">
          
          {/* Left Panel: Hero & Branding */}
          <div className="flex flex-col items-center justify-center p-7 sm:p-8 bg-[#F8FAFC]/90 backdrop-blur-xs border-b md:border-b-0 md:border-r border-slate-200/50 space-y-7">
            <div className="w-full max-w-[280px] flex items-center justify-center">
              <img
                src={logoUrl}
                alt="CEBU TELE-NET PHILIPPINES Logo"
                className="w-full h-auto object-contain drop-shadow-xs"
              />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-[#2F6798] font-black text-[17.6px] tracking-wider uppercase leading-snug">
                CEBU TELE-NET PHILIPPINES
              </h2>
              <p className="text-[#2F6798]/80 font-bold text-xs tracking-wide uppercase">
                TRAINING PERFORMANCE HUB
              </p>
            </div>
          </div>

          {/* Right Panel: Login Form */}
          <div className="flex flex-col justify-center py-9 sm:py-10 px-5 sm:px-6 bg-white">
            
            {/* Header Section */}
            <div className="text-center space-y-1.5 mb-6">
              <h1 className="text-3xl font-bold text-[#2F6798] tracking-wider">
                LOGIN
              </h1>
              <p className="text-xs font-normal text-[#94A3B8] leading-normal">
                Enter your credentials to access the Training Performance Hub.
              </p>
            </div>

            {/* Lockout Banner ONLY when locked out */}
            {isLockedOut && generalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-[#EF4444]/40 flex items-start gap-2.5 text-[#EF4444] text-xs animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                <span className="leading-snug font-medium">{generalError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              
              {/* Email Field with Red Border & Red Text Below */}
              <div>
                <input
                  type="email"
                  id="email"
                  disabled={isLockedOut || isLoading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                    if (passwordError) setPasswordError(null);
                    if (generalError) setGeneralError(null);
                  }}
                  placeholder="nreguero.telenet@gmail.com"
                  className={`w-full py-3 px-4 rounded-lg placeholder-[#94A3B8] text-xs font-normal border transition-all duration-200 ${
                    emailError
                      ? 'border-[#EF4444] bg-[#EEF4FB] text-[#EF4444] focus:outline-none focus:border-[#EF4444]'
                      : 'border-[#E2E8F0] bg-[#EEF4FB]/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F6798] focus:border-transparent'
                  } disabled:opacity-50 disabled:bg-slate-50`}
                />
                {emailError && (
                  <p className="text-[11px] text-[#EF4444] mt-1 leading-snug font-normal animate-in fade-in duration-200">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password Field with Red Border, Red Text, and Red Error Below */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    disabled={isLockedOut || isLoading}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError(null);
                      if (generalError) setGeneralError(null);
                    }}
                    placeholder="••••••••"
                    className={`w-full py-3 pl-4 pr-10 rounded-lg placeholder-[#94A3B8] text-xs font-normal border transition-all duration-200 ${
                      passwordError
                        ? 'border-[#EF4444] bg-[#EEF4FB] text-[#EF4444] focus:outline-none focus:border-[#EF4444]'
                        : 'border-[#E2E8F0] bg-[#EEF4FB]/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2F6798] focus:border-transparent'
                    } disabled:opacity-50 disabled:bg-slate-50`}
                  />
                  <button
                    type="button"
                    disabled={isLockedOut}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-slate-600 transition-colors p-1 disabled:opacity-40 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-[#94A3B8]" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#94A3B8]" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] text-[#EF4444] mt-1 leading-snug font-normal animate-in fade-in duration-200">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="rememberMe"
                  disabled={isLockedOut}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E2E8F0] text-[#2F6798] accent-[#2F6798] focus:ring-[#2F6798]/20 cursor-pointer disabled:opacity-50"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-xs font-medium text-[#475569] cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>

              {/* Primary "LOGIN" Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading || isLockedOut}
                  className="w-full py-3 px-4 rounded-lg bg-[#2F6798] hover:bg-[#24527A] active:bg-[#1D446C] text-white font-bold text-xs tracking-wider uppercase shadow-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Signing In...</span>
                    </>
                  ) : isLockedOut ? (
                    <span>LOCKED ({lockoutSeconds}S)</span>
                  ) : (
                    <span>LOGIN</span>
                  )}
                </button>
              </div>

              {/* "Continue with Google" Button */}
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading || isGoogleLoading || isLockedOut}
                  className="w-full py-2.5 px-4 rounded-lg bg-white border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2.5 shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#2F6798]" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>

        </div>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFullScreenLoader />}>
      <LoginFormContent />
    </Suspense>
  );
}
