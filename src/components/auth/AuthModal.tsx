import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Cloud,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { awsConfig } from '../../config/awsConfig';
import { AuthUser } from '../../types';
import { apiClient } from '../../services/apiClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  contextTitle?: string;
  contextSubtitle?: string;
  intendedRole?: 'renter' | 'owner';
  onSuccess?: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  contextTitle,
  contextSubtitle,
  intendedRole = 'renter',
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'renter' | 'owner'>(intendedRole);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP verification state
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMode(initialMode as 'login' | 'signup');
    setRole(intendedRole);
    setError(null);
    setSuccess(null);
    setOtpCode(['', '', '', '', '', '']);
    if (intendedRole === 'owner') {
      setEmail('rameshwar.reddy@srisairesidency.in');
    } else {
      setEmail('');
    }
  }, [isOpen, initialMode, intendedRole]);

  // Countdown for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otpCode];
    next[idx] = digit;
    setOtpCode(next);
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setOtpCode(paste.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    const res = await apiClient.post('/api/auth/resend-code', { email });
    setLoading(false);
    if (res.success) {
      setSuccess('A new code has been sent to your email.');
      setResendCooldown(60);
      setOtpCode(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } else {
      setError(res.error?.message || 'Failed to resend code.');
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpCode.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await apiClient.post('/api/auth/verify', { email, code });
    setLoading(false);
    if (res.success) {
      setSuccess('Email verified! Signing you in...');
      const loginRes = await authService.login(email, password);
      if (loginRes.success && loginRes.user) {
        onSuccess?.(loginRes.user);
        onClose();
      } else {
        setSuccess('Email verified! Please sign in with your credentials.');
        setTimeout(() => { setMode('login'); setSuccess(null); }, 2000);
      }
    } else {
      setError(res.error?.message || 'Invalid code. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'login') {
      if (!email.trim()) {
        setError('Please enter your registered email address.');
        setLoading(false);
        return;
      }
      const res = await authService.login(email, password);
      setLoading(false);
      if (res.success && res.user) {
        onSuccess?.(res.user);
        onClose();
      } else {
        if (res.error?.toLowerCase().includes('verif')) {
          setMode('verify');
          setError(null);
        } else {
          setError(res.error || 'Authentication failed. Please verify credentials.');
        }
      }
    } else {
      if (!fullName.trim() || !email.trim() || !phone.trim()) {
        setError('Please fill in your name, email, and mobile number.');
        setLoading(false);
        return;
      }
      const res = await authService.signup({
        email,
        fullName,
        phone,
        currentLocation: '',
        occupation: role === 'owner' ? 'Property Host & Owner' : 'Student / Professional',
        password,
        role,
      });
      setLoading(false);
      if (res.success) {
        if (awsConfig.isCloudBackendConfigured) {
          setMode('verify');
          setError(null);
          setResendCooldown(60);
          setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } else if (res.user) {
          onSuccess?.(res.user);
          onClose();
        }
      } else {
        setError(res.error || 'Sign up failed.');
      }
    }
  };

  const handleQuickDemoLogin = (persona: 'student' | 'professional' | 'owner' | 'owner_b') => {
    const user = authService.loginAsDemoUser(persona);
    onSuccess?.(user);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      onClick={onClose}
    >
      <div
        className="neomorph-card"
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: 'min(92vh, 780px)',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'fadeInDown 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Contextual Action Banner */}
        {contextTitle && (
          <div
            style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderBottom: '1.5px solid #bae6fd',
              padding: '1rem 1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                width: '36px', height: '36px', borderRadius: '10px', background: '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#0284c7', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.15)', flexShrink: 0,
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {contextTitle}
              </div>
              {contextSubtitle && (
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>{contextSubtitle}</div>
              )}
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: mode === 'verify' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(2, 132, 199, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: mode === 'verify' ? '#10b981' : '#0284c7',
              }}
            >
              {mode === 'verify' ? <KeyRound size={20} /> : <User size={20} />}
            </div>
            <div>
              <h3
                id="auth-modal-title"
                style={{
                  fontFamily: 'var(--font-headline)', fontSize: '1.15rem', fontWeight: 800,
                  color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em',
                }}
              >
                {mode === 'verify' ? 'Verify Your Email' : 'Inveni Stay Account'}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '1px' }}>
                <Cloud size={11} color="#0284c7" />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {mode === 'verify'
                    ? `Code sent to ${email}`
                    : awsConfig.isCloudBackendConfigured ? 'AWS Cognito Authentication' : 'Secure Demo Session'}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button" onClick={onClose} aria-label="Close authentication modal"
            style={{
              width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1',
              background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#64748b', cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs â€” hidden in verify mode */}
        {mode !== 'verify' && (
          <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                style={{
                  flex: 1, padding: '0.75rem', border: 'none',
                  background: mode === m ? '#ffffff' : 'transparent',
                  borderBottom: mode === m ? '2.5px solid #0284c7' : 'none',
                  fontFamily: 'var(--font-ui)', fontSize: '0.86rem', fontWeight: 800,
                  color: mode === m ? '#0284c7' : '#64748b', cursor: 'pointer',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '1.4rem' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.82rem', marginBottom: '1rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /><span>{error}</span>
            </div>
          )}
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac', color: '#15803d', fontSize: '0.82rem', marginBottom: '1rem' }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} /><span>{success}</span>
            </div>
          )}

          {/* â”€â”€ OTP VERIFY â”€â”€ */}
          {mode === 'verify' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', borderRadius: '12px', padding: '1rem 1.1rem', border: '1px solid #bae6fd' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0369a1', marginBottom: '0.3rem' }}>ðŸ“§ Check your inbox</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  We sent a <strong>6-digit code</strong> to <strong>{email}</strong>. Enter it below to activate your account.
                </div>
              </div>

              <div>
                <label style={labelStyle}>Verification Code</label>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }} onPaste={handleOtpPaste}>
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      style={{
                        width: '48px', height: '56px', textAlign: 'center',
                        fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-ui)',
                        border: digit ? '2px solid #0284c7' : '1.5px solid #cbd5e1',
                        borderRadius: '10px', background: digit ? '#f0f9ff' : '#f8fafc',
                        color: '#0f172a', outline: 'none', transition: 'all 0.15s ease',
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading || otpCode.join('').length < 6}
                className="btn-primary"
                style={{
                  width: '100%', padding: '0.85rem', fontSize: '0.94rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  opacity: otpCode.join('').length < 6 ? 0.6 : 1,
                }}
              >
                <span>{loading ? 'Verifying...' : 'Verify & Sign In'}</span>
                <CheckCircle2 size={16} />
              </button>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Didn't receive it? </span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: 700,
                    color: resendCooldown > 0 ? '#94a3b8' : '#0284c7',
                    cursor: resendCooldown > 0 ? 'default' : 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  }}
                >
                  <RefreshCw size={12} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: '#64748b', cursor: 'pointer', textAlign: 'center' }}
              >
                â† Back to Sign In
              </button>
            </div>
          )}

          {/* â”€â”€ LOGIN / SIGNUP FORM â”€â”€ */}
          {mode !== 'verify' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {mode === 'signup' && (
                <>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <div style={inputContainerStyle}>
                      <User size={16} color="#64748b" />
                      <input type="text" placeholder="e.g. Venkata Siva Kumar" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} required />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Account Role</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {(['renter', 'owner'] as const).map((r) => (
                        <button key={r} type="button" onClick={() => setRole(r)}
                          style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: role === r ? '2px solid #0284c7' : '1px solid #cbd5e1', background: role === r ? '#f0f9ff' : '#ffffff', color: role === r ? '#0284c7' : '#475569', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                          {r === 'renter' ? 'Renter / Student' : 'Property Owner'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label style={labelStyle}>Email Address</label>
                <div style={inputContainerStyle}>
                  <Mail size={16} color="#64748b" />
                  <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div style={inputContainerStyle}>
                  <Lock size={16} color="#64748b" />
                  <input type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label style={labelStyle}>Mobile Number</label>
                  <div style={inputContainerStyle}>
                    <Phone size={16} color="#64748b" />
                    <input type="tel" placeholder="9849012345" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} required />
                  </div>
                </div>
              )}

              <button
                type="submit" disabled={loading} className="btn-primary"
                style={{ marginTop: '0.5rem', width: '100%', padding: '0.85rem', fontSize: '0.94rem', fontWeight: 800 }}
              >
                <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In & Continue' : 'Create Account & Continue'}</span>
                <ArrowRight size={16} />
              </button>

              {mode === 'login' && (
                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => { setMode('verify'); setError(null); }}
                    style={{ background: 'none', border: 'none', fontSize: '0.78rem', color: '#0284c7', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Have a verification code? Enter it here â†’
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Demo Personas */}
          {mode !== 'verify' && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1.15rem', borderTop: '1px dashed #cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Quick 1-Click Evaluation Personas:</span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: 'var(--radius-full)', background: 'rgba(217, 119, 6, 0.12)', color: 'var(--c-goldenrod)', border: '1px solid rgba(217, 119, 6, 0.3)' }}>DEMO SWITCH</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button type="button" onClick={() => handleQuickDemoLogin('student')} style={personaButtonStyle}>
                  <div style={{ fontWeight: 800, color: '#0284c7' }}>Student Renter</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Venkata Siva (Kadapa â†’ Panyam)</div>
                </button>
                <button type="button" onClick={() => handleQuickDemoLogin('professional')} style={personaButtonStyle}>
                  <div style={{ fontWeight: 800, color: '#16a34a' }}>Pro Renter</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ananya Sharma (TCS Relocator)</div>
                </button>
                <button type="button" onClick={() => handleQuickDemoLogin('owner')} style={{ ...personaButtonStyle, border: '1.5px solid rgba(217, 119, 6, 0.4)' }}>
                  <div style={{ fontWeight: 800, color: '#d97706' }}>Owner A (Sri Sai)</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Rameshwar Reddy (Panyam, 12 Rms)</div>
                </button>
                <button type="button" onClick={() => handleQuickDemoLogin('owner_b')} style={{ ...personaButtonStyle, border: '1.5px solid rgba(139, 92, 246, 0.4)' }}>
                  <div style={{ fontWeight: 800, color: '#8b5cf6' }}>Owner B (Lakshmi)</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Lakshmi Narayana (Nandyal, 18 Rms)</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155',
  textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem',
};

const inputContainerStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  padding: '0.55rem 0.75rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px',
};

const inputStyle: React.CSSProperties = {
  flex: 1, border: 'none', outline: 'none', background: 'transparent',
  fontSize: '0.86rem', color: '#0f172a', fontFamily: 'var(--font-ui)',
};

const personaButtonStyle: React.CSSProperties = {
  padding: '0.55rem 0.65rem', background: '#f8fafc', border: '1.5px solid #cbd5e1',
  borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
  textAlign: 'left', transition: 'all 0.15s ease',
};