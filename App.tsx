

import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Registration from './components/Registration';
import OnboardingSurvey from './components/OnboardingSurvey';
import Dashboard from './components/Dashboard';
import MLValidationLab from './components/MLValidationLab';
import VideoTherapy from './components/VideoTherapy';
import DeveloperHub from './components/DeveloperHub';
import ChatBot from './components/ChatBot';
import WellnessPlan from './components/WellnessPlan';
import HealthReportAnalyzer from './components/HealthReportAnalyzer';
import Profile from './components/Profile';
import Settings from './components/Settings';
import ProgressTracker from './components/ProgressTracker'; // Import new component
import MusicTherapy from './components/MusicTherapy';
import { TherapistDashboard } from './components/TherapistDashboard';
import { AssessmentResult, SurveyData, UserProfile } from './types';
import { db } from './services/databaseService';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('loading');
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Phase 0: Check Database for existing user
    const user = db.getUser();
    if (user) {
      setCurrentUser(user);

      const savedSurvey = db.getSurvey();
      const savedAssessment = db.getAssessment();

      if (savedSurvey && savedAssessment) {
        setSurveyData(savedSurvey);
        setAssessment(savedAssessment);
        setActiveTab('dashboard');
      } else {
        setActiveTab('survey');
      }
    } else {
      setActiveTab('registration');
    }
  }, []);

  const handleRegistrationComplete = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveTab('survey');
  };

  const handleSurveyComplete = (data: SurveyData, result: AssessmentResult) => {
    setSurveyData(data);
    setAssessment(result);
    setActiveTab('dashboard');
  };

  if (activeTab === 'loading') {
    return <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center text-white">Loading...</div>;
  }

  // Registration Page (No Layout)
  if (activeTab === 'registration') {
    return <Registration onRegister={handleRegistrationComplete} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'survey':
        // If coming from registration or incomplete survey
        return <OnboardingSurvey onComplete={handleSurveyComplete} />;
      case 'dashboard':
        return <Dashboard assessment={assessment} onNavigate={setActiveTab} />;
      case 'profile':
        return <Profile />;
      case 'wellness':
        return <WellnessPlan />;
      case 'progress': // New Route
        return <ProgressTracker />;
      case 'health-reports':
        return <HealthReportAnalyzer />;
      case 'chatbot':
        return <ChatBot />;
      case 'ml-lab':
        return <MLValidationLab />;
      case 'telehealth':
        return <VideoTherapy />;
      case 'music-therapy':
        return <MusicTherapy />;
      case 'clinician':
        return <TherapistDashboard />;
      case 'developer':
        return <DeveloperHub />;
      case 'settings':
        return <Settings />;
      default:
        return <div className="p-8 text-center text-slate-500">Module under construction</div>;
    }
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          {renderContent()}
        </Layout>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
