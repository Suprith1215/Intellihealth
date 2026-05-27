import React from 'react';
import {
  Activity, BookOpen, BarChart2, Video, Settings, Menu, X,
  Terminal, MessageSquare, HeartPulse, FileText,
  User, Users, Headphones, FileBarChart, TrendingUp,
  ChevronRight, Bell, Search
} from 'lucide-react';
import { GlobalVoiceAssistant } from './GlobalVoiceAssistant';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const IntelliHealLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const dims = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  return (
    <svg width={dims} height={dims} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Shield body */}
      <path
        d="M22 3L6 9.5V21C6 30.5 13 39 22 42C31 39 38 30.5 38 21V9.5L22 3Z"
        fill="url(#logoGrad)"
        fillOpacity="0.15"
        stroke="url(#logoGrad)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter="url(#logoGlow)"
      />
      {/* Neural cross/brain symbol */}
      <circle cx="22" cy="21" r="4" fill="url(#logoGrad)" opacity="0.9" />
      <line x1="22" y1="13" x2="22" y2="29" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="14" y1="21" x2="30" y2="21" stroke="url(#logoGrad)" strokeWidth="1.5" strokeLinecap="round" />
      {/* Neural nodes */}
      <circle cx="22" cy="13" r="2" fill="url(#logoGrad)" opacity="0.7" />
      <circle cx="22" cy="29" r="2" fill="url(#logoGrad)" opacity="0.7" />
      <circle cx="14" cy="21" r="2" fill="url(#logoGrad)" opacity="0.7" />
      <circle cx="30" cy="21" r="2" fill="url(#logoGrad)" opacity="0.7" />
      {/* Diagonal neural connections */}
      <line x1="16.5" y1="15.5" x2="27.5" y2="26.5" stroke="url(#logoGrad)" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.5" />
      <line x1="27.5" y1="15.5" x2="16.5" y2="26.5" stroke="url(#logoGrad)" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Home', icon: Activity },
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'progress', label: 'Progress', icon: TrendingUp },
      ]
    },
    {
      label: 'AI Features',
      items: [
        { id: 'chatbot', label: 'AI Assistant', icon: MessageSquare },
        { id: 'survey', label: 'Assessment', icon: BookOpen },
        { id: 'ml-lab', label: 'ML Lab', icon: BarChart2 },
        { id: 'health-reports', label: 'Health Reports', icon: FileText },
        { id: 'weekly-reports', label: 'Weekly Reports', icon: FileBarChart },
      ]
    },
    {
      label: 'Wellness',
      items: [
        { id: 'wellness', label: 'Wellness Plan', icon: HeartPulse },
        { id: 'telehealth', label: 'Therapy', icon: Video },
        { id: 'music-therapy', label: 'Music Therapy', icon: Headphones },
        { id: 'clinician', label: 'Clinician Portal', icon: Users },
      ]
    },
    {
      label: 'System',
      items: [
        { id: 'developer', label: 'Developer Hub', icon: Terminal },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  const allNavItems = navGroups.flatMap(g => g.items);
  const currentLabel = allNavItems.find(i => i.id === activeTab)?.label || 'Home';

  return (
    <div className="flex h-screen text-slate-100 overflow-hidden" style={{ background: '#080612' }}>

      {/* ━━━━━ SIDEBAR ━━━━━ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}
        style={{
          width: '260px',
          background: 'rgba(12, 8, 30, 0.95)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.4)'
        }}
      >
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="relative flex-shrink-0">
            <div style={{
              position: 'absolute', inset: -4,
              background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
              borderRadius: '50%', filter: 'blur(6px)'
            }} />
            <IntelliHealLogo size="md" />
          </div>
          <div>
            <h1 style={{
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.2,
            }}>IntelliHeal</h1>
            <p style={{ fontSize: '10px', color: 'rgba(148,163,184,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              AI Health Platform
            </p>
          </div>
          {/* Mobile close */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto md:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6" style={{ scrollbarWidth: 'none' }}>
          {navGroups.map((group) => (
            <div key={group.label}>
              <p style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(148,163,184,0.4)',
                padding: '0 12px',
                marginBottom: '6px'
              }}>
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}`}
                      onClick={() => { onTabChange(item.id); setIsSidebarOpen(false); }}
                      className="flex items-center w-full group transition-all duration-200"
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: isActive
                          ? 'linear-gradient(135deg, rgba(124,58,237,0.25) 0%, rgba(6,182,212,0.15) 100%)'
                          : 'transparent',
                        border: isActive ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                          (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.06)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.border = '1px solid transparent';
                        }
                      }}
                    >
                      {isActive && (
                        <div style={{
                          position: 'absolute', left: 0, top: '25%', bottom: '25%',
                          width: '3px', borderRadius: '0 4px 4px 0',
                          background: 'linear-gradient(to bottom, #7C3AED, #06B6D4)'
                        }} />
                      )}
                      <div style={{
                        width: 32, height: 32,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '8px',
                        marginRight: '10px',
                        flexShrink: 0,
                        background: isActive
                          ? 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(6,182,212,0.3))'
                          : 'rgba(255,255,255,0.04)',
                        transition: 'all 0.2s',
                      }}>
                        <item.icon
                          className="w-4 h-4"
                          style={{ color: isActive ? '#a78bfa' : 'rgba(148,163,184,0.6)' }}
                        />
                      </div>
                      <span style={{
                        fontSize: '13.5px',
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#e2e8f0' : 'rgba(148,163,184,0.7)',
                        transition: 'color 0.2s',
                      }}>
                        {item.label}
                      </span>
                      {isActive && (
                        <ChevronRight className="w-3 h-3 ml-auto opacity-50" style={{ color: '#a78bfa' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.1) 100%)',
            border: '1px solid rgba(124,58,237,0.2)',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#a78bfa', marginBottom: '2px' }}>
              IntelliHeal v2.0
            </p>
            <p style={{ fontSize: '10px', color: 'rgba(148,163,184,0.5)' }}>
              AI Model: GPT-4 Turbo + Gemini Pro
            </p>
          </div>
        </div>
      </aside>

      {/* ━━━━━ MAIN AREA ━━━━━ */}
      <div className="flex-1 flex flex-col overflow-hidden relative">

        {/* Top Header Bar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: '64px',
          background: 'rgba(8, 6, 18, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
          zIndex: 10,
        }}>
          {/* Left side */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Mobile logo */}
            <div className="flex items-center gap-2 md:hidden">
              <IntelliHealLogo size="sm" />
              <span style={{ fontWeight: 700, fontSize: '15px', color: '#e2e8f0' }}>IntelliHeal</span>
            </div>
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2">
              <span style={{ fontSize: '13px', color: 'rgba(148,163,184,0.4)' }}>IntelliHeal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{currentLabel}</span>
            </div>
          </div>

          {/* Right side Controls */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 relative">
              {isSearchOpen ? (
                <input
                  autoFocus
                  onBlur={() => setIsSearchOpen(false)}
                  placeholder="Search features..."
                  style={{
                    width: '200px',
                    padding: '7px 14px 7px 36px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '13px',
                    color: '#e2e8f0',
                    outline: 'none',
                  }}
                />
              ) : null}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg text-slate-400 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Bell className="w-4 h-4" />
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 7, height: 7, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                border: '1.5px solid #080612',
              }} />
            </button>

            {/* Avatar */}
            <button
              onClick={() => onTabChange('profile')}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 700, color: 'white',
                border: '2px solid rgba(124,58,237,0.4)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              IH
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main
          className="flex-1 overflow-auto"
          style={{
            background: 'transparent',
            padding: '28px 28px',
            position: 'relative',
          }}
        >
          {/* Background ambient glows */}
          <div style={{
            position: 'fixed', top: '10%', left: '20%',
            width: '500px', height: '500px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0,
          }} />
          <div style={{
            position: 'fixed', bottom: '10%', right: '10%',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0,
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <GlobalVoiceAssistant onNavigate={onTabChange} />
    </div>
  );
};

export default Layout;