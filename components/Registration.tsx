import React, { useState } from 'react';
import { UserProfile } from '../types';
import { db } from '../services/databaseService';
import { Shield, Eye, EyeOff, ArrowRight, Sparkles, Brain, HeartPulse, Lock } from 'lucide-react';

interface RegistrationProps {
  onRegister: (user: UserProfile) => void;
}

// Inline SVG Logo
const IntelliHealLogo = () => (
  <svg width="48" height="48" viewBox="0 0 44 44" fill="none">
    <defs>
      <linearGradient id="regGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
      <filter id="regGlow"><feGaussianBlur stdDeviation="2" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
    </defs>
    <path d="M22 3L6 9.5V21C6 30.5 13 39 22 42C31 39 38 30.5 38 21V9.5L22 3Z"
      fill="url(#regGrad)" fillOpacity="0.15" stroke="url(#regGrad)" strokeWidth="1.5" filter="url(#regGlow)" />
    <circle cx="22" cy="21" r="4.5" fill="url(#regGrad)" opacity="0.95" />
    <line x1="22" y1="12" x2="22" y2="30" stroke="url(#regGrad)" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="13" y1="21" x2="31" y2="21" stroke="url(#regGrad)" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="22" cy="12" r="2.2" fill="url(#regGrad)" opacity="0.7" />
    <circle cx="22" cy="30" r="2.2" fill="url(#regGrad)" opacity="0.7" />
    <circle cx="13" cy="21" r="2.2" fill="url(#regGrad)" opacity="0.7" />
    <circle cx="31" cy="21" r="2.2" fill="url(#regGrad)" opacity="0.7" />
  </svg>
);

const Registration: React.FC<RegistrationProps> = ({ onRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    emergencyContact: '',
    password: '',
  });
  const [step, setStep] = useState<'register' | 'confirm'>('register');
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    { icon: <Brain className="w-5 h-5" />, title: 'AI Risk Detection', desc: '95.4% accuracy multimodal analysis', color: '#7C3AED' },
    { icon: <HeartPulse className="w-5 h-5" />, title: 'Real-time Wellness', desc: 'Continuous health monitoring', color: '#EC4899' },
    { icon: <Shield className="w-5 h-5" />, title: 'Crisis Intervention', desc: 'Immediate support when needed', color: '#06B6D4' },
    { icon: <Lock className="w-5 h-5" />, title: 'HIPAA Compliant', desc: 'Your data is always safe', color: '#34d399' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const user: UserProfile = {
      id: Date.now().toString(),
      name: formData.name,
      age: 0,
      phoneNumber: formData.phone,
      emergencyContact: formData.emergencyContact,
      joinedDate: new Date().toISOString(),
    };
    db.saveUser(user);
    onRegister(user);
    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080612',
      display: 'flex',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* ── Background glows ──────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-20%', right: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* ── LEFT PANEL ──────────────────────────────────────────── */}
      <div style={{
        width: '50%', padding: '60px 56px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', zIndex: 1,
      }} className="hidden md:flex">
        {/* Logo + Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 64 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: -8, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }} />
              <IntelliHealLogo />
            </div>
            <div>
              <h1 style={{
                fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                lineHeight: 1.2,
              }}>IntelliHeal</h1>
              <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                AI Health Platform
              </p>
            </div>
          </div>

          <h2 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-0.03em', color: '#f0f4f8', lineHeight: 1.15, marginBottom: 16 }}>
            Your recovery journey<br />
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>starts here.</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(148,163,184,0.7)', lineHeight: 1.7, maxWidth: 380, marginBottom: 48 }}>
            IntelliHeal combines cutting-edge AI with evidence-based recovery programs to give you the support you deserve — 24/7.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `${f.color}15`,
                  border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(148,163,184,0.5)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer copy */}
        <div style={{ display: 'flex', gap: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {['HIPAA Secured', 'SOC 2 Compliant', 'End-to-End Encrypted'].map(t => (
            <span key={t} style={{ fontSize: 11, color: 'rgba(148,163,184,0.4)', letterSpacing: '0.04em' }}>✓ {t}</span>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — FORM ────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px', position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: '100%', maxWidth: 440,
          padding: 40,
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.05) inset',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Card top accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.6), rgba(6,182,212,0.4), transparent)',
          }} />

          {/* Mobile logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }} className="md:hidden">
            <IntelliHealLogo />
            <span style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0' }}>IntelliHeal</span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600, letterSpacing: '0.05em' }}>
                GET STARTED FREE
              </span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f0f4f8', letterSpacing: '-0.02em' }}>
              Create your account
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)', marginTop: 6 }}>
              Your data stays private. Always.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(148,163,184,0.7)', marginBottom: 6, letterSpacing: '0.03em' }}>
                Full Name
              </label>
              <input
                className="input"
                placeholder="e.g. Aarav Singh"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(148,163,184,0.7)', marginBottom: 6, letterSpacing: '0.03em' }}>
                Phone Number
              </label>
              <input
                className="input"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                required
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(148,163,184,0.7)', marginBottom: 6, letterSpacing: '0.03em' }}>
                Emergency Contact <span style={{ color: 'rgba(148,163,184,0.4)', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                className="input"
                placeholder="Sponsor or family member's name"
                value={formData.emergencyContact}
                onChange={e => setFormData(p => ({ ...p, emergencyContact: e.target.value }))}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(148,163,184,0.7)', marginBottom: 6, letterSpacing: '0.03em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(148,163,184,0.5)', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ width: '100%', padding: '13px 22px', fontSize: 14, marginTop: 4, justifyContent: 'center' }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderTopColor: 'white', animation: 'spin 0.7s linear infinite',
                  }} />
                  Setting up your account...
                </>
              ) : (
                <>
                  Begin My Journey
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p style={{ fontSize: 11, color: 'rgba(148,163,184,0.4)', textAlign: 'center', lineHeight: 1.6 }}>
              By continuing, you agree to our{' '}
              <span style={{ color: '#a78bfa', cursor: 'pointer' }}>Terms of Service</span> and{' '}
              <span style={{ color: '#a78bfa', cursor: 'pointer' }}>Privacy Policy</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
