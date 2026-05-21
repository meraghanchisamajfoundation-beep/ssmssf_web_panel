"use client";
import React, { useState, useEffect } from 'react';
import { App } from 'antd';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { getDeviceInfo } from '@/lib/commonFun';
import { doc, setDoc } from 'firebase/firestore';
import Image from 'next/image';
import { TrsutData } from '@/lib/constentData';

const OTP_TIMEOUT = 60;
const OTP_VALIDITY_DAYS = 7;
const OTP_STORAGE_KEY = 'lastOtpVerification';

const getLastVerification = (email) => {
  try {
    const stored = localStorage.getItem(OTP_STORAGE_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored);
    return data[email] || null;
  } catch { return null; }
};

const setLastVerification = (email) => {
  try {
    const stored = localStorage.getItem(OTP_STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : {};
    data[email] = new Date().toISOString();
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

const needsOTPVerification = (email) => {
  const lastVerified = getLastVerification(email);
  if (!lastVerified) return true;
  const diffDays = (Date.now() - new Date(lastVerified).getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= OTP_VALIDITY_DAYS;
};

async function saveSession(userId, sessionToken) {
  const deviceInfo = getDeviceInfo();
  const ipRes = await fetch("https://ipapi.co/json/");
  const locationData = await ipRes.json();
  const session = {
    ip: locationData.ip,
    location: `${locationData.city}, ${locationData.region}, ${locationData.country_name}`,
    pinCode: locationData.postal,
    device: deviceInfo.device,
    os: deviceInfo.os,
    browser: deviceInfo.browser,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    sessionToken,
  };
  await setDoc(doc(db, "users", userId, "sessions", sessionToken), session);
}

// ─── Icons (Gold/Brown Theme) ─────────────────────────────────────────────────
const IconMail = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);
const IconOTP = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IconEyeOff = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);
const IconEye = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const IconShield = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
const Loader = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: 'lp-spin 0.8s linear infinite' }}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

// ─── Alert (Light Mode with Gold/Brown Theme) ────────────────────────────────
const alertStyles = {
  info:    { background: '#fff8e8', borderLeft: '3px solid #c8860a', color: '#7a5000' },
  success: { background: '#f0f9ed', borderLeft: '3px solid #4a7c2e', color: '#2d5a1a' },
  error:   { background: '#fef2f0', borderLeft: '3px solid #c2410c', color: '#9a3412' },
};
const AlertBox = ({ msg, type }) => (
  <div style={{ ...alertStyles[type], padding: '0.55rem 0.85rem', borderRadius: 10, fontSize: 13, marginBottom: 14, fontFamily: "'Outfit', sans-serif" }}>
    {msg}
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const LoginPage = () => {
  const { message } = App.useApp();

  const [step, setStep]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [email, setEmail]         = useState('');
  const [emailVal, setEmailVal]   = useState('');
  const [otpVal, setOtpVal]       = useState('');
  const [passVal, setPassVal]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [alert, setAlert]         = useState(null);

  const showAlert = (msg, type = 'info') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4500);
  };

  function generateSessionToken() {
    return 'sess_' + crypto.randomUUID();
  }

  useEffect(() => {
    if (countdown <= 0) { setCanResend(step === 2); return; }
    const t = setInterval(() => setCountdown(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [countdown, step]);

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    if (!emailVal || !emailVal.includes('@')) { showAlert('Please enter a valid email address.', 'error'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/user', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkEmail', email: emailVal }),
      });
      const data = await res.json();
      if (!data.exists) { showAlert('This email is not registered.', 'error'); setLoading(false); return; }
      if (needsOTPVerification(emailVal)) {
        const otpRes = await fetch('/api/opt-send-verify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'send', email: emailVal }),
        });
        if (otpRes.ok) {
          setEmail(emailVal);
          showAlert('OTP sent to your email!', 'success');
          setStep(2); setCountdown(OTP_TIMEOUT); setCanResend(false);
        } else {
          const d = await otpRes.json();
          showAlert(d.error || 'Failed to send OTP.', 'error');
        }
      } else {
        setEmail(emailVal); setStep(3);
        showAlert('Please enter your password to continue.', 'info');
      }
    } catch { showAlert('An error occurred. Please try again.', 'error'); }
    setLoading(false);
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    if (!otpVal || otpVal.length !== 6) { showAlert('Please enter the 6-digit OTP.', 'error'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/opt-send-verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email, otp: otpVal }),
      });
      if (res.ok) { setLastVerification(email); showAlert('OTP verified! Please enter your password.', 'success'); setStep(3); }
      else { showAlert('OTP verification failed.', 'error'); }
    } catch { showAlert('An error occurred during verification.', 'error'); }
    setLoading(false);
  };

  const onSubmitPassword = async (e) => {
    e.preventDefault();
    if (!passVal || passVal.length < 6) { showAlert('Password must be at least 6 characters.', 'error'); return; }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, passVal);
      const user = userCredential.user;
      let sessionToken = localStorage.getItem('session_token');
      if (!sessionToken) { sessionToken = generateSessionToken(); localStorage.setItem('session_token', sessionToken); }
      await saveSession(user.uid, sessionToken);
      message.success('Login Successful!');
      window.location.href = '/';
    } catch (error) { showAlert(error.message || 'Login failed.', 'error'); }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) { showAlert('Please enter your email first.', 'error'); setStep(1); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      showAlert('Password reset link sent! Check your inbox.', 'success');
    } catch (error) { showAlert(error.message || 'Failed to send reset link.', 'error'); }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    const res = await fetch('/api/opt-send-verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send', email }),
    });
    if (res.ok) { showAlert('New OTP sent!', 'success'); setCountdown(OTP_TIMEOUT); setCanResend(false); }
    else { const d = await res.json(); showAlert(d.error || 'Failed to resend OTP.', 'error'); }
    setLoading(false);
  };

  const stepLabels = [
    'Step 1 of 3 — Identification',
    'Step 2 of 3 — Verification',
    'Step 3 of 3 — Authentication',
  ];

  // ─── Light Mode Styles (Keeping Original Gold/Brown Colors) ────────────────
  const inputStyle = {
    width: '100%', height: 46, padding: '0 12px 0 40px',
    border: '1px solid #e8d5b5',
    borderRadius: 10,
    background: '#ffffff',
    fontSize: 14, color: '#4a3a1a',
    fontFamily: "'Outfit', sans-serif", outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const labelStyle = {
    display: 'block', fontSize: 10, fontWeight: 700, color: '#b8860b',
    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7,
  };
  const btnPrimary = {
    width: '100%', height: 48, marginTop: 10,
    background: 'linear-gradient(135deg, #c8860a 0%, #9a5000 60%, #7a3000 100%)',
    color: '#fff8e0', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 700, fontFamily: "'Outfit', sans-serif",
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.75 : 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    letterSpacing: '0.04em',
    boxShadow: '0 4px 12px rgba(200,134,10,0.25)',
    transition: 'opacity 0.15s, transform 0.1s',
  };
  const btnLink = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#b8860b', fontSize: 12, fontWeight: 600,
    fontFamily: "'Outfit', sans-serif", padding: 0,
    textDecoration: 'underline', textUnderlineOffset: 3,
  };
  const inputIconStyle = {
    position: 'absolute', left: 13, color: '#c8860a',
    pointerEvents: 'none', display: 'flex', top: '50%', transform: 'translateY(-50%)',
  };

  const getDotStyle = (dotStep) => ({
    height: 4, borderRadius: 2, transition: 'all 0.35s',
    width: dotStep === step ? 28 : 14,
    background: dotStep < step
      ? '#c8860a'
      : dotStep === step
        ? '#c8860a'
        : '#e8d5b5',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');

        * { box-sizing: border-box; }

        @keyframes lp-spin    { to { transform: rotate(360deg); } }
        @keyframes lp-fadeUp  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes lp-float   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .lp-step  { animation: lp-fadeUp 0.32s ease; }
        .lp-btn:hover:not(:disabled)  { opacity: 0.88 !important; transform: translateY(-1px); }
        .lp-btn:active:not(:disabled) { transform: scale(0.99) !important; }

        .lp-input:focus {
          border-color: #c8860a !important;
          box-shadow: 0 0 0 3px rgba(200,134,10,0.12) !important;
        }
        .lp-input::placeholder { color: #d4b896; font-size: 13px; }

        .lp-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          border-bottom: 1px solid #f0e6d5;
          font-size: 12.5px;
          color: #8b6914;
          font-family: 'Outfit', sans-serif;
        }
        .lp-feature:last-child { border-bottom: none; }
        .lp-feature-icon {
          width: 28px; height: 28px; border-radius: 7px;
          background: #fff8ed;
          border: 1px solid #e8d5b5;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: #c8860a;
        }

        @media (max-width: 750px) {
          .lp-left { display: none !important; }
          .lp-right { padding: 1.5rem 1rem !important; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', fontFamily: "'Outfit', sans-serif",
        background: 'linear-gradient(135deg, #fef9ef 0%, #fff5e6 50%, #fef0e0 100%)',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* ── Background subtle pattern ── */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,134,10,0.06) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,69,19,0.05) 0%, transparent 65%)' }} />
          <div style={{ position: 'absolute', top: '40%', left: '45%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,160,23,0.04) 0%, transparent 65%)' }} />
        </div>

        {/* ── Left Panel (Light Mode with Gold Theme) ── */}
        <div className="lp-left" style={{
          flexShrink: 0, width: 380,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '3rem 2.5rem', position: 'relative',
          background: '#ffffff',
          borderRight: '1px solid #f0e0c8',
          boxShadow: '4px 0 20px rgba(0,0,0,0.02)',
        }}>
          {/* Top accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #8b1a00, #c8860a, #f0c040, #c8860a, #8b1a00)' }} />

          {/* Logo emblem */}
          <div style={{ position: 'relative', marginBottom: '2rem' }}>
            <div style={{ width: 140, height: 140, borderRadius: '50%', border: '2px solid #e8d5b5', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', boxShadow: '0 0 32px rgba(200,134,10,0.08)' }}>
              <div className="lp-logo-float" style={{ width: 110, height: 110, borderRadius: '50%', overflow: 'hidden' }}>
                <Image src={TrsutData.logo} alt="Trust Logo" width={110} height={110} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>
          </div>

          {/* Trust name */}
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <h1 style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", fontSize: '1.15rem', fontWeight: 600, color: '#8b6914', lineHeight: 1.4, margin: 0 }}>
              {TrsutData.name}
            </h1>
            <p style={{ fontSize: 11, color: '#b8860b', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 5, marginBottom: 0 }}>
              {TrsutData.cityState}
            </p>
          </div>

          {/* Gold divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.8rem', width: '100%' }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #e8d5b5)' }} />
            <span style={{ color: '#c8860a', fontSize: 14 }}>❋</span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #e8d5b5, transparent)' }} />
          </div>
          {/* Bottom accent */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #8b1a00, #c8860a, #f0c040, #c8860a, #8b1a00)' }} />
        </div>

        {/* ── Right Panel ── */}
        <div className="lp-right" style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2.5rem 2rem',
        }}>
          <div className="lp-card" style={{
            width: '100%', maxWidth: 420,
            background: '#ffffff',
            borderRadius: 20,
            border: '1px solid #f0e0c8',
            boxShadow: '0 8px 40px rgba(0,0,0,0.06), 0 0 0 1px rgba(200,134,10,0.08)',
            overflow: 'hidden',
          }}>

            {/* Card header */}
            <div style={{
              background: 'linear-gradient(135deg, #fffaf0 0%, #fff5e6 100%)',
              borderBottom: '1px solid #f0e0c8',
              padding: '1.6rem 2rem',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%', border: '22px solid rgba(200,134,10,0.05)' }} />
              <div style={{ position: 'absolute', bottom: -40, left: 20, width: 90, height: 90, borderRadius: '50%', border: '18px solid rgba(139,69,19,0.04)' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#b8860b', marginBottom: 5, fontWeight: 600 }}>
                  {stepLabels[step - 1]}
                </div>
                <div style={{ fontSize: '1.5rem', color: '#4a3a1a', fontWeight: 700, fontFamily: "'Cormorant Garamond', serif", letterSpacing: '0.01em' }}>
                  Welcome Back, <span style={{ color: '#c8860a', fontStyle: 'italic' }}>User</span>
                </div>
                <div style={{ display: 'flex', gap: 5, marginTop: 14, alignItems: 'center' }}>
                  {[1, 2, 3].map(d => <div key={d} style={getDotStyle(d)} />)}
                </div>
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: '1.75rem 2rem 1.5rem' }}>
              {alert && <AlertBox msg={alert.msg} type={alert.type} />}

              {/* ── Step 1: Email ── */}
              {step === 1 && (
                <form className="lp-step" onSubmit={onSubmitEmail}>
                  <label style={labelStyle}>Email Address</label>
                  <div style={{ position: 'relative', marginBottom: 18 }}>
                    <span style={inputIconStyle}><IconMail /></span>
                    <input
                      type="email" className="lp-input" style={inputStyle}
                      placeholder="you@example.com"
                      value={emailVal} onChange={e => setEmailVal(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <button type="submit" className="lp-btn" style={btnPrimary} disabled={loading}>
                    {loading && <Loader />}
                    {loading ? 'Checking…' : 'Continue →'}
                  </button>
                </form>
              )}

              {/* ── Step 2: OTP ── */}
              {step === 2 && (
                <form className="lp-step" onSubmit={onSubmitOtp}>
                  <label style={labelStyle}>One-Time Password</label>
                  <div style={{ position: 'relative', marginBottom: 8 }}>
                    <span style={inputIconStyle}><IconOTP /></span>
                    <input
                      type="text" className="lp-input" style={{ ...inputStyle, letterSpacing: '0.3em', textAlign: 'center', paddingLeft: 12 }}
                      placeholder="• • • • • •"
                      maxLength={6} value={otpVal}
                      onChange={e => setOtpVal(e.target.value.replace(/\D/g, ''))}
                      autoComplete="one-time-code"
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, fontSize: 12, color: '#b8860b' }}>
                    <span>Sent to {email}</span>
                    <span style={{ color: countdown > 0 ? '#c8860a' : '#8b1a00', fontWeight: 700 }}>
                      {countdown > 0 ? `${countdown}s` : 'Expired'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <button type="button" style={{ ...btnLink, opacity: canResend ? 1 : 0.38, cursor: canResend ? 'pointer' : 'not-allowed' }}
                      onClick={canResend ? handleResendOTP : undefined}>
                      Resend OTP
                    </button>
                    <button type="button" style={btnLink} onClick={() => setStep(1)}>← Change Email</button>
                  </div>
                  <button type="submit" className="lp-btn" style={btnPrimary} disabled={loading}>
                    {loading && <Loader />}
                    {loading ? 'Verifying…' : 'Verify OTP →'}
                  </button>
                </form>
              )}

              {/* ── Step 3: Password ── */}
              {step === 3 && (
                <form className="lp-step" onSubmit={onSubmitPassword}>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative', marginBottom: 6 }}>
                    <span style={inputIconStyle}><IconLock /></span>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="lp-input" style={{ ...inputStyle, paddingRight: 44 }}
                      placeholder="Enter your password"
                      value={passVal} onChange={e => setPassVal(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#c8860a', display: 'flex', padding: 0 }}>
                      {showPass ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <button type="button" style={btnLink} onClick={handleForgotPassword}>Forgot Password?</button>
                  </div>
                  <button type="submit" className="lp-btn" style={btnPrimary} disabled={loading}>
                    {loading && <Loader />}
                    {loading ? 'Logging in…' : 'Login →'}
                  </button>
                </form>
              )}
            </div>

            {/* Card footer */}
            <div style={{
              padding: '0.9rem 2rem 1.2rem',
              borderTop: '1px solid #f0e0c8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontSize: 11, color: '#b8860b',
              fontFamily: "'Outfit', sans-serif",
              background: '#fffaf5',
            }}>
              <span style={{ color: '#c8860a', display: 'flex' }}><IconShield /></span>
              <span>Secure portal &nbsp;·&nbsp; {TrsutData.name} &nbsp;·&nbsp; All data encrypted</span>
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default LoginPage;