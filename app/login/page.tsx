'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();

  // Storage Image URLs from Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zhdmsmwrskxowvytedgh.supabase.co';
  const bgImageUrl = `${supabaseUrl}/storage/v1/object/public/Images/ctnp-bg-image-1.png`;
  const logoUrl = `${supabaseUrl}/storage/v1/object/public/Images/ctnp-logo-full.png`;

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check remembered email if available
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('ctnp_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMessage(error.message || 'Invalid login credentials.');
        setIsLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem('ctnp_remembered_email', email.trim());
      } else {
        localStorage.removeItem('ctnp_remembered_email');
      }

      // Successful login -> Redirect to dashboard
      router.push('/');
    } catch (err: unknown) {
      console.error('Login error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsGoogleLoading(false);
      }
    } catch (err: unknown) {
      console.error('Google login error:', err);
      setErrorMessage('Failed to initiate Google sign-in.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#0a0f16] overflow-hidden select-none">
      
      {/* Background Graphic from Supabase Storage */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0 scale-105 transform transition-transform duration-1000"
        style={{
          backgroundImage: `url("${bgImageUrl}")`,
        }}
      >
        {/* Soft gradient overlay for optimal card focus */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/50" />
      </div>

      {/* Main Login Card Modal */}
      <div className="relative z-10 w-full max-w-[880px] bg-white rounded-[26px] sm:rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Side: Brand Logo & Company Titles */}
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 md:p-14 bg-white border-b md:border-b-0 md:border-r border-slate-100/80">
            <div className="relative w-44 sm:w-56 h-32 sm:h-40 flex items-center justify-center mb-6">
              <img
                src={logoUrl}
                alt="CEBU TELE-NET PHILIPPINES Logo"
                className="max-w-full max-h-full object-contain drop-shadow-sm"
              />
            </div>

            <div className="text-center space-y-1.5 mt-2">
              <h2 className="text-[#1D446C] font-extrabold text-sm sm:text-base tracking-wider uppercase">
                CEBU TELE-NET PHILIPPINES
              </h2>
              <p className="text-[#4F7C9E] font-bold text-[10px] sm:text-[11px] tracking-widest uppercase">
                WORKFORCE PORTAL
              </p>
            </div>
          </div>

          {/* Right Side: Authentication Form */}
          <div className="flex flex-col justify-center p-8 sm:p-10 md:p-12 bg-white">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-[#1D446C] tracking-tight">
                LOGIN
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 max-w-[260px] mx-auto leading-relaxed">
                Enter your credentials to access the Workforce Portal.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200/80 flex items-center gap-2.5 text-red-700 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bcolonia.telenet@gmail.com"
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-[#EEF4FB] text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-medium border border-transparent focus:border-[#2A6193]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2A6193]/20 transition-all duration-200"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 sm:py-3.5 pr-11 rounded-xl bg-[#EEF4FB] text-slate-800 placeholder-slate-400 text-xs sm:text-sm font-medium border border-transparent focus:border-[#2A6193]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2A6193]/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-slate-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-0.5 pb-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#2A6193] focus:ring-[#2A6193]/30 cursor-pointer accent-[#2A6193]"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-xs text-slate-600 font-medium cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-[#2A6193] hover:bg-[#204F7A] active:bg-[#1A4166] text-white font-bold text-xs sm:text-sm tracking-wider uppercase shadow-md shadow-[#2A6193]/25 hover:shadow-lg hover:shadow-[#2A6193]/35 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>LOGIN</span>
                )}
              </button>

              {/* Continue with Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || isGoogleLoading}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all duration-200 shadow-xs flex items-center justify-center gap-2.5 disabled:opacity-70 cursor-pointer"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

            </form>
          </div>

        </div>
      </div>

    </div>
  );
}
