
import React, { useState } from 'react';
import { User, Phone, Heart, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { db } from '../services/databaseService';

interface RegistrationProps {
  onRegister: (user: UserProfile) => void;
}

const Registration: React.FC<RegistrationProps> = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    phoneNumber: '',
    emergencyContact: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.phoneNumber) return;

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: formData.name,
      age: parseInt(formData.age),
      phoneNumber: formData.phoneNumber,
      emergencyContact: formData.emergencyContact,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    // Save to "MongoDB" (LocalStorage)
    db.saveUser(newUser);
    onRegister(newUser);
  };

  return (
    <div className="min-h-screen bg-[#0f0a1e] flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/50">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">AddictiveCare</h1>
        <p className="text-slate-400 mt-2">IntelliHeal Platform Registration</p>
      </div>

      <div className="w-full max-w-md bg-[#1a1429] border border-white/5 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Create your Patient Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="text"
                required
                className="w-full bg-[#0f0a1e] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Age</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="number"
                required
                min="18"
                max="100"
                className="w-full bg-[#0f0a1e] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="25"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="tel"
                required
                className="w-full bg-[#0f0a1e] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="+1 (555) 000-0000"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Emergency Contact</label>
            <div className="relative">
              <Heart className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input
                type="tel"
                required
                className="w-full bg-[#0f0a1e] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="Parent/Guardian Number"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              * We will contact this number only in critical high-risk events.
            </p>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center"
          >
            Start Assessment <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </form>
      </div>
      <p className="text-slate-600 text-xs mt-8">Secure & Private Healthcare Grade Encryption</p>
    </div>
  );
};

export default Registration;
