import React, { useEffect, useState } from 'react';
import { User, Phone, Heart, Calendar, ShieldCheck, Activity, Award, Clock } from 'lucide-react';
import { db } from '../services/databaseService';
import { UserProfile, AssessmentResult, SurveyData } from '../types';

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [survey, setSurvey] = useState<SurveyData | null>(null);

  useEffect(() => {
    setUser(db.getUser());
    setAssessment(db.getAssessment());
    setSurvey(db.getSurvey());
  }, []);

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-slate-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
            <p className="text-slate-400">Please complete the registration process to view your profile.</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-[#1a1429] border border-white/5 p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
         <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg shrink-0">
            {user.name.charAt(0)}
         </div>
         <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-white">{user.name}</h1>
            <p className="text-slate-400">Member since {user.joinedDate}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
               <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/20 font-medium font-mono">ID: {user.id}</span>
               {assessment && (
                   <span className={`px-3 py-1 text-xs rounded-full border font-medium ${
                       assessment.riskLevel === 'Critical' || assessment.riskLevel === 'High Risk' 
                       ? 'bg-red-500/20 text-red-300 border-red-500/20' 
                       : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20'
                   }`}>
                       {assessment.riskLevel}
                   </span>
               )}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Personal Details */}
         <div className="bg-[#1a1429] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
               <User className="w-5 h-5 mr-2 text-purple-400" /> Personal Information
            </h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center text-slate-300">
                     <Calendar className="w-4 h-4 mr-3 text-slate-500" /> Age
                  </div>
                  <span className="font-bold text-white">{user.age} Years</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center text-slate-300">
                     <Phone className="w-4 h-4 mr-3 text-slate-500" /> Phone
                  </div>
                  <span className="font-bold text-white">{user.phoneNumber}</span>
               </div>
               <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-center text-red-200">
                     <Heart className="w-4 h-4 mr-3 text-red-400" /> Emergency Contact
                  </div>
                  <span className="font-bold text-red-400">{user.emergencyContact}</span>
               </div>
            </div>
         </div>

         {/* Clinical Profile */}
         <div className="bg-[#1a1429] border border-white/5 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center">
               <Activity className="w-5 h-5 mr-2 text-pink-400" /> Clinical Profile
            </h3>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center text-slate-300">
                     <ShieldCheck className="w-4 h-4 mr-3 text-slate-500" /> Primary Focus
                  </div>
                  <span className="font-bold text-white">{survey?.addictionType || 'Not Set'}</span>
               </div>
               {assessment ? (
                   <>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center text-slate-300">
                            <Clock className="w-4 h-4 mr-3 text-slate-500" /> Recovery Stage
                        </div>
                        <span className="font-bold text-white">{assessment.recoveryStage}</span>
                    </div>
                    <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20 mt-2">
                        <div className="flex justify-between text-xs text-purple-300 mb-2">
                            <span>Relapse Probability Score</span>
                            <span>{(assessment.predictedRelapseProb * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${assessment.predictedRelapseProb * 100}%`}}></div>
                        </div>
                    </div>
                   </>
               ) : (
                   <div className="p-4 text-center text-slate-500 text-sm bg-white/5 rounded-xl border border-white/5 border-dashed">
                       Assessment pending
                   </div>
               )}
            </div>
         </div>
      </div>
      
      {/* Progress Stats Summary */}
      <div className="bg-[#1a1429] border border-white/5 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center">
             <Award className="w-5 h-5 mr-2 text-yellow-400" /> Progress Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 p-4 rounded-xl text-center">
                 <p className="text-xs text-slate-500 uppercase font-bold">Current Streak</p>
                 <p className="text-2xl font-bold text-white mt-1">12 Days</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl text-center">
                 <p className="text-xs text-slate-500 uppercase font-bold">Total Points</p>
                 <p className="text-2xl font-bold text-yellow-400 mt-1">850</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl text-center">
                 <p className="text-xs text-slate-500 uppercase font-bold">Check-ins</p>
                 <p className="text-2xl font-bold text-green-400 mt-1">24</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl text-center">
                 <p className="text-xs text-slate-500 uppercase font-bold">Badges</p>
                 <p className="text-2xl font-bold text-purple-400 mt-1">5</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Profile;