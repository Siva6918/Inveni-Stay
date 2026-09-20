import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Briefcase,
  ArrowRight,
  Sparkles,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { awsConfig } from '../../config/awsConfig';
import { AuthUser } from '../../types';

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
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Kadapa, Andhra Pradesh');
  const [occupation, setOccupation] = useState(
    intendedRole === 'owner' ? 'Property Host & Owner' : 'Student (Polytechnic Engineering)'
  );
  const [role, setRole] = useState<'renter' | 'owner'>(intendedRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setRole(intendedRole);
    if (intendedRole === 'owner') {
      setEmail('rameshwar.reddy@srisairesidency.in');
      setOccupation('Property Host & Owner');
    } else {
      setEmail('');
      setOccupation('Student (Polytechnic Engineering)');
    }
  }, [isOpen, initialMode, intendedRole]);

  if (!isOpen) return null;

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
        setError(res.error || 'Authentication failed. Please verify credentials.');
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
        currentLocation,
        occupation,
        password,
        role,
      });
      setLoading(false);
      if (res.success && res.user) {
        onSuccess?.(res.user);
        onClose();
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
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeInDown 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Contextual Action Banner (e.g. "Continue to your booking") */}
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
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
                boxShadow: '0 2px 6px rgba(2, 132, 199, 0.15)',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {contextTitle}
              </div>
              {contextSubtitle && (
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>
                  {contextSubtitle}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Top Lockup */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(2, 132, 199, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
              }}
            >
              <User size={20} />
            </div>
            <div>
              <h3
                id="auth-modal-title"
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Inveni Stay Account
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '1px' }}>
                <Cloud size={11} color="#0284c7" />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {awsConfig.isCloudBackendConfigured ? 'AWS Cognito Authentication' : 'Secure Demo Session'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication modal"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Switcher Tabs (Sign In vs Create Account) */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: mode === 'login' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: mode === 'login' ? '2.5px solid #0284c7' : 'none',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.86rem',
              fontWeight: 800,
              color: mode === 'login' ? '#0284c7' : '#64748b',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: mode === 'signup' ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: mode === 'signup' ? '2.5px solid #0284c7' : 'none',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.86rem',
              fontWeight: 800,
              color: mode === 'signup' ? '#0284c7' : '#64748b',
              cursor: 'pointer',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.4rem' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 0.85rem',
                background: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: '0.82rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {mode === 'signup' && (
              <>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <div style={inputContainerStyle}>
                    <User size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="e.g. Venkata Siva Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Account Role</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setRole('renter')}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: role === 'renter' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: role === 'renter' ? '#f0f9ff' : '#ffffff',
                        color: role === 'renter' ? '#0284c7' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      Renter / Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('owner')}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: role === 'owner' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        background: role === 'owner' ? '#f0f9ff' : '#ffffff',
                        color: role === 'owner' ? '#0284c7' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      Property Owner
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={labelStyle}>Email Address</label>
              <div style={inputContainerStyle}>
                <Mail size={16} color="#64748b" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <div style={inputContainerStyle}>
                <Lock size={16} color="#64748b" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>Mobile Number</label>
                <div style={inputContainerStyle}>
                  <Phone size={16} color="#64748b" />
                  <input
                    type="tel"
                    placeholder="9849012345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.94rem',
                fontWeight: 800,
              }}
            >
              <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In & Continue' : 'Create Account & Continue'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Evaluator / Demo Persona Switchers */}
          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1.15rem',
              borderTop: '1px dashed #cbd5e1',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.65rem',
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                Quick 1-Click Evaluation Personas:
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(217, 119, 6, 0.12)',
                  color: 'var(--c-goldenrod)',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                }}
              >
                DEMO SWITCH
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('student')}
                style={personaButtonStyle}
              >
                <div style={{ fontWeight: 800, color: '#0284c7' }}>Student Renter</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Venkata Siva (Kadapa $\rightarrow$ Panyam)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('professional')}
                style={personaButtonStyle}
              >
                <div style={{ fontWeight: 800, color: '#16a34a' }}>Pro Renter</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ananya Sharma (TCS Relocator)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('owner')}
                style={{
                  ...personaButtonStyle,
                  border: '1.5px solid rgba(217, 119, 6, 0.4)',
                }}
              >
                <div style={{ fontWeight: 800, color: '#d97706' }}>Owner A (Sri Sai)</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Rameshwar Reddy (Panyam, 12 Rms)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('owner_b')}
                style={{
                  ...personaButtonStyle,
                  border: '1.5px solid rgba(139, 92, 246, 0.4)',
                }}
              >
                <div style={{ fontWeight: 800, color: '#8b5cf6' }}>Owner B (Lakshmi)</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Lakshmi Narayana (Nandyal, 18 Rms)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.74rem',
  fontWeight: 700,
  color: '#334155',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '0.35rem',
};

const inputContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.55rem 0.75rem',
  background: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: '0.86rem',
  color: '#0f172a',
  fontFamily: 'var(--font-ui)',
};

const personaButtonStyle: React.CSSProperties = {
  padding: '0.55rem 0.65rem',
  background: '#f8fafc',
  border: '1.5px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '0.78rem',
  fontWeight: 700,
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'all 0.15s ease',
};
