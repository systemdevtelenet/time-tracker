'use client';

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Geist } from 'next/font/google';
import { CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, ShieldAlert, UserRound, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { logUserLogin } from '@/lib/activityLogs';
import './login.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-tt-geist' });
const headlineWords = ['Stay ready.', 'Stay aligned.', 'Stay informed.'];

function LoginFullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white p-6">
      <Loader2 className="mb-4 size-10 animate-spin text-[#2F6798]" />
      <h2 className="text-lg font-semibold text-[#17283B]">Loading dashboard...</h2>
    </div>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = window.setInterval(() => setHeadlineIndex((index) => (index + 1) % headlineWords.length), 3200);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized_domain') {
      setEmailError('Access denied: Please sign in using your official company Google account (*.telenet@gmail.com or @cebutelenet.com).');
    } else if (errorParam === 'not_authorized') {
      setEmailError('Access denied: Your account has not been added by an administrator or granted system access.');
    }
    if (searchParams.get('logout') === 'true') {
      setShowLogoutToast(true);
      const timer = setTimeout(() => setShowLogoutToast(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('ctnp_remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    setFailedAttempts(parseInt(localStorage.getItem('ctnp_login_failed_attempts') || '0', 10));
    const lockoutUntil = parseInt(localStorage.getItem('ctnp_lockout_until') || '0', 10);
    if (lockoutUntil > Date.now()) setLockoutSeconds(Math.ceil((lockoutUntil - Date.now()) / 1000));
  }, []);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(interval);
          localStorage.removeItem('ctnp_lockout_until');
          localStorage.setItem('ctnp_login_failed_attempts', '0');
          setFailedAttempts(0);
          setGeneralError(null);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const validateForm = useCallback(() => {
    let valid = true;
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
    if (!email.trim()) {
      setEmailError('Email address is required.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    }
    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    }
    return valid;
  }, [email, password]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (lockoutSeconds > 0) {
      setGeneralError(`Too many failed attempts. Locked out for 60 seconds. (${lockoutSeconds}s remaining)`);
      return;
    }
    if (!validateForm()) return;
    setIsLoading(true);
    setGeneralError(null);
    setEmailError(null);
    setPasswordError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        if (response.status === 401) {
          const nextAttempts = failedAttempts + 1;
          setFailedAttempts(nextAttempts);
          localStorage.setItem('ctnp_login_failed_attempts', nextAttempts.toString());
          if (nextAttempts >= 5) {
            localStorage.setItem('ctnp_lockout_until', (Date.now() + 60000).toString());
            setLockoutSeconds(60);
            setGeneralError('Too many failed attempts. Locked out for 60 seconds. (60s remaining)');
          } else {
            setPasswordError('Sign-in requires the correct credentials and an active employee record with an employee code and email.');
          }
        } else {
          setGeneralError(data?.error || `The login service could not complete the request (HTTP ${response.status}).`);
        }
        setIsLoading(false);
        return;
      }

      try {
        await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
      } catch (authClientError) {
        console.warn('Supabase client auth sign in warning:', authClientError);
      }
      localStorage.removeItem('ctnp_login_failed_attempts');
      localStorage.removeItem('ctnp_lockout_until');
      if (data.user) localStorage.setItem('ctnp_current_user', JSON.stringify(data.user));
      localStorage.setItem('tele_active_tab', 'dashboard');
      if (rememberMe) localStorage.setItem('ctnp_remembered_email', email.trim());
      else localStorage.removeItem('ctnp_remembered_email');
      sessionStorage.setItem('ctnp_show_login_toast', 'true');
      logUserLogin(email.trim(), 'System Auth');
      setIsRedirecting(true);
      router.push('/?tab=dashboard');
    } catch (error) {
      console.error('Login exception:', error);
      setGeneralError('Unable to reach the login service. Check your connection and try again.');
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
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setEmailError(error.message || 'Failed to initiate Google sign-in.');
        setIsGoogleLoading(false);
      }
    } catch (error) {
      console.error('Google login error:', error);
      setEmailError('Failed to initiate Google sign-in.');
      setIsGoogleLoading(false);
    }
  };

  const isLockedOut = lockoutSeconds > 0;

  return (
    <main className={`tt-login ${geist.variable}`}>
      {isRedirecting && <LoginFullScreenLoader />}
      {showLogoutToast && (
        <div className="tt-login-toast" role="status">
          <CheckCircle2 size={20} />
          <span>You have been signed out successfully.</span>
          <button type="button" onClick={() => setShowLogoutToast(false)} aria-label="Dismiss notification"><X size={16} /></button>
        </div>
      )}

      <section className="tt-login-hero" aria-label="Workforce Portal">
        <img className="tt-login-hero-image" src="/login-hero.png" alt="Customer service representative wearing a headset" />
        <div className="tt-login-hero-shade" />
        <div className="tt-login-ring tt-login-ring-blue" />
        <div className="tt-login-ring tt-login-ring-gold" />
        <div className="tt-login-hero-content">
          <div className="tt-login-hero-copy">
            <h1>Clock in.<br />Track time.<br /><span>{headlineWords[headlineIndex]}</span><i className="tt-login-cursor" aria-hidden="true" /></h1>
            <div className="tt-login-rule" />
            <p>Keep your shifts, attendance, and time records in one place.</p>
          </div>
          <div className="tt-login-hero-bottom">
            <div className="tt-login-features">
              <div><span>Track</span><strong>Work time at a glance</strong></div>
              <div><span>Review</span><strong>Shifts and attendance</strong></div>
              <div><span>Understand</span><strong>Workforce insights</strong></div>
            </div>
            <div className="tt-login-hero-footer"><span>Workforce Portal</span><span>CTNP | Philippines</span></div>
          </div>
        </div>
      </section>

      <section className="tt-login-panel" aria-label="Sign in">
        <div className="tt-login-column">
          <img className="tt-login-logo" src="/logo.png" alt="CTNP" />
          <p className="tt-login-mobile-tagline">Clock in. Track time. Stay informed.</p>
          <div className="tt-login-intro">
            <h2>Welcome back</h2>
            <p>Sign in to your workforce workspace.</p>
          </div>

          {isLockedOut && generalError && (
            <div className="tt-login-lockout" role="alert"><ShieldAlert size={18} /><span>{generalError}</span></div>
          )}
          <form onSubmit={handleLogin} noValidate>
            <div className="tt-login-field">
              <label htmlFor="email">Email</label>
              <div className={`tt-login-input-wrap ${emailError ? 'tt-login-input-error' : ''}`}>
                <UserRound size={20} aria-hidden="true" />
                <input type="email" id="email" autoComplete="username" disabled={isLockedOut || isLoading} value={email} onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError) setEmailError(null);
                  if (passwordError) setPasswordError(null);
                  if (generalError) setGeneralError(null);
                }} placeholder="you@cebutelenet.com" aria-invalid={!!emailError} aria-describedby={emailError ? 'email-error' : undefined} />
              </div>
              {emailError && <p id="email-error" className="tt-login-error" role="alert">{emailError}</p>}
            </div>
            <div className="tt-login-field">
              <label htmlFor="password">Password</label>
              <div className={`tt-login-input-wrap ${passwordError ? 'tt-login-input-error' : ''}`}>
                <LockKeyhole size={20} aria-hidden="true" />
                <input type={showPassword ? 'text' : 'password'} id="password" autoComplete="current-password" disabled={isLockedOut || isLoading} value={password} onChange={(event) => {
                  setPassword(event.target.value);
                  if (passwordError) setPasswordError(null);
                  if (generalError) setGeneralError(null);
                }} placeholder="Enter your password" aria-invalid={!!passwordError} aria-describedby={passwordError ? 'password-error' : undefined} />
                <button type="button" disabled={isLockedOut} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError && <p id="password-error" className="tt-login-error" role="alert">{passwordError}</p>}
            </div>
            <div className="tt-login-options">
              <label><input type="checkbox" disabled={isLockedOut} checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />Remember me</label>
              <span title="Contact your administrator for account assistance">Need help?</span>
            </div>
            <button className="tt-login-submit" type="submit" disabled={isLoading || isGoogleLoading || isLockedOut}>
              {isLoading ? <><Loader2 size={18} className="animate-spin" />Signing in...</> : isLockedOut ? `Locked (${lockoutSeconds}s)` : 'Sign In'}
            </button>
            <div className="tt-login-separator"><span>Or</span></div>
            <button className="tt-login-google" type="button" onClick={handleGoogleLogin} disabled={isLoading || isGoogleLoading || isLockedOut}>
              {isGoogleLoading ? <Loader2 size={18} className="animate-spin" /> : <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>}
              {isGoogleLoading ? 'Connecting...' : 'Sign in with Google'}
            </button>
          </form>
          <p className="tt-login-panel-footer">Workforce Portal | Internal use only</p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<LoginFullScreenLoader />}><LoginFormContent /></Suspense>;
}
