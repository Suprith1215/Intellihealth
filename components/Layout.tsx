import React from 'react';
import { Activity, BookOpen, BarChart2, Video, Settings, Menu, ShieldCheck, Terminal, MessageSquare, HeartPulse, FileText, LogOut, User, Users, Headphones } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Activity },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'chatbot', label: 'AI Assistant', icon: MessageSquare },
    { id: 'wellness', label: 'Wellness Plan', icon: HeartPulse },
    { id: 'health-reports', label: 'Health Reports', icon: FileText },
    { id: 'survey', label: 'Assessment', icon: BookOpen },
    { id: 'ml-lab', label: 'ML Lab', icon: BarChart2 },
    { id: 'telehealth', label: 'Therapy', icon: Video },
    { id: 'music-therapy', label: 'Music Therapy', icon: Headphones },
    { id: 'clinician', label: 'Clinician Portal', icon: Users },
    { id: 'developer', label: 'Developer', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#0f0a1e] text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1429] border-r border-white/5 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
        <div className="flex items-center h-20 px-6 border-b border-white/5">
          <ShieldCheck className="w-8 h-8 text-purple-500 mr-3" />
          <h1 className="text-xl font-bold tracking-wide text-white">AddictiveCare</h1>
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsSidebarOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === item.id
                ? 'bg-purple-600 shadow-lg shadow-purple-900/50 text-white'
                : item.id === 'developer'
                  ? 'text-teal-400 hover:bg-white/5'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-white' : 'text-slate-500'}`} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-4 bg-[#1a1429] border-b border-white/5 md:hidden">
          <div className="flex items-center">
            <ShieldCheck className="w-6 h-6 text-purple-500 mr-2" />
            <span className="font-bold text-white">AddictiveCare</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md text-slate-400 hover:bg-white/10">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-auto bg-gradient-to-br from-[#0f0a1e] to-[#160c2e] p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;