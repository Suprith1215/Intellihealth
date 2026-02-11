import React, { useState, useEffect } from 'react';
import {
    User, Bell, Shield, Moon, LogOut, Save,
    Smartphone, Lock, Eye, Download, Trash2,
    HelpCircle, ChevronRight, Mail, BellRing,
    Globe, AlertTriangle, Check, FileText
} from 'lucide-react';
import { db } from '../services/databaseService';
import { UserProfile } from '../types';
import { APP_VERSION } from '../constants';
import { useToast } from '../contexts/ToastContext';

const Settings: React.FC = () => {
    const { showToast } = useToast();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        emergencyContact: '',
        email: ''
    });

    // Preferences State (Mocked)
    const [notifications, setNotifications] = useState({
        dailyCheckin: true,
        therapyReminders: true,
        riskAlerts: true,
        communityUpdates: false
    });

    const [privacy, setPrivacy] = useState({
        shareWithCounselor: true,
        biometricLogin: true,
        analyticsSharing: false
    });

    useEffect(() => {
        const userData = db.getUser();
        if (userData) {
            setUser(userData);
            setFormData({
                name: userData.name,
                phoneNumber: userData.phoneNumber,
                emergencyContact: userData.emergencyContact,
                email: userData.email || ''
            });
        }
    }, []);

    const handleSaveProfile = () => {
        if (!user) return;
        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            const updatedUser: UserProfile = {
                ...user,
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                emergencyContact: formData.emergencyContact,
                email: formData.email
            };

            db.saveUser(updatedUser);
            setUser(updatedUser);
            setIsEditing(false);
            setIsLoading(false);
            showToast("Profile updated successfully.", "success");
        }, 800);
    };

    const handleLogout = () => {
        showToast("Session cleared. Logging you out...", "info");
        // Simulate logout delay then clear
        setTimeout(() => {
            db.clearDatabase();
        }, 1000);
    };

    const handleDeleteAccount = () => {
        const confirmation = prompt("Type 'DELETE' to confirm account deletion. This action cannot be undone.");
        if (confirmation === 'DELETE') {
            showToast("Account deletion processed. Goodbye.", "error");
            setTimeout(() => db.clearDatabase(), 1500);
        }
    };

    const handleDownloadData = () => {
        showToast("Preparing your data archive (GDPR Compliant)...", "info");
        setTimeout(() => showToast("Download started: my_health_data.zip", "success"), 2000);
    };

    const handleHelpCenter = () => {
        showToast("Navigate to Help Center (External Link)", "info");
    };

    const handleTerms = () => {
        showToast("Opening Terms of Service...", "info");
    };

    const Toggle = ({ label, checked, onChange, description }: { label: string, checked: boolean, onChange: () => void, description?: string }) => (
        <div className="flex items-center justify-between py-4">
            <div>
                <p className="font-medium text-white">{label}</p>
                {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
            </div>
            <button
                onClick={() => {
                    onChange();
                    showToast(`${label} ${!checked ? 'Enabled' : 'Disabled'}`, "info");
                }}
                className={`w-12 h-6 rounded-full transition-colors relative ${checked ? 'bg-purple-600' : 'bg-slate-700'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${checked ? 'left-7' : 'left-1'}`}></div>
            </button>
        </div>
    );

    if (!user) return <div className="p-8 text-white">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="bg-[#1a1429] border border-white/5 p-8 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
                <p className="text-slate-400">Manage your profile, preferences, and privacy controls.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN - NAVIGATION / INFO */}
                <div className="space-y-6">
                    {/* User Card */}
                    <div className="bg-[#1a1429] border border-white/5 p-6 rounded-xl text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                            {user.name.charAt(0)}
                        </div>
                        <h3 className="text-xl font-bold text-white">{user.name}</h3>
                        <p className="text-slate-400 text-sm mb-4">Patient ID: {user.id}</p>
                        <div className="inline-flex items-center px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                            <Shield className="w-3 h-3 mr-1" /> Account Active
                        </div>
                    </div>

                    {/* App Info */}
                    <div className="bg-[#1a1429] border border-white/5 p-6 rounded-xl">
                        <h4 className="font-bold text-white mb-4">About App</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-slate-400">
                                <span>Version</span>
                                <span className="text-white">{APP_VERSION}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>Build</span>
                                <span className="text-white">Beta (Evaluation)</span>
                            </div>
                            <hr className="border-white/5 my-2" />
                            <button onClick={handleHelpCenter} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
                                <HelpCircle className="w-4 h-4 mr-2" /> Help Center
                            </button>
                            <button onClick={handleTerms} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
                                <FileText className="w-4 h-4 mr-2" /> Terms of Service
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - SETTINGS FORMS */}
                <div className="lg:col-span-2 space-y-8">

                    {/* 1. Account Settings */}
                    <section className="bg-[#1a1429] border border-white/5 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <h3 className="font-bold text-white flex items-center">
                                <User className="w-5 h-5 mr-2 text-purple-400" /> Account Information
                            </h3>
                            <button
                                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center ${isEditing
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center">Saving...</span>
                                ) : isEditing ? (
                                    <span className="flex items-center"><Save className="w-3 h-3 mr-2" /> Save Changes</span>
                                ) : (
                                    "Edit Profile"
                                )}
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        disabled={!isEditing}
                                        className="w-full bg-[#0f0a1e] border border-white/10 rounded-lg p-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-purple-500 outline-none transition-colors"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        disabled={!isEditing}
                                        className="w-full bg-[#0f0a1e] border border-white/10 rounded-lg p-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-purple-500 outline-none transition-colors"
                                        value={formData.phoneNumber}
                                        onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email (Optional)</label>
                                    <input
                                        type="email"
                                        disabled={!isEditing}
                                        className="w-full bg-[#0f0a1e] border border-white/10 rounded-lg p-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-purple-500 outline-none transition-colors"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Link your email"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-red-400">Emergency Contact</label>
                                    <input
                                        type="tel"
                                        disabled={!isEditing}
                                        className="w-full bg-[#0f0a1e] border border-red-500/20 rounded-lg p-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-red-500 outline-none transition-colors"
                                        value={formData.emergencyContact}
                                        onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. Notifications */}
                    <section className="bg-[#1a1429] border border-white/5 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                            <h3 className="font-bold text-white flex items-center">
                                <Bell className="w-5 h-5 mr-2 text-yellow-400" /> Notifications
                            </h3>
                        </div>
                        <div className="p-6 divide-y divide-white/5">
                            <Toggle
                                label="Daily Check-in Reminders"
                                description="Receive a notification at 9:00 AM daily."
                                checked={notifications.dailyCheckin}
                                onChange={() => setNotifications({ ...notifications, dailyCheckin: !notifications.dailyCheckin })}
                            />
                            <Toggle
                                label="Therapy & Medication Alerts"
                                description="Push notifications for upcoming sessions and medication times."
                                checked={notifications.therapyReminders}
                                onChange={() => setNotifications({ ...notifications, therapyReminders: !notifications.therapyReminders })}
                            />
                            <Toggle
                                label="Risk Prediction Alerts"
                                description="Immediate alerts when AI detects high relapse probability patterns."
                                checked={notifications.riskAlerts}
                                onChange={() => setNotifications({ ...notifications, riskAlerts: !notifications.riskAlerts })}
                            />
                        </div>
                    </section>

                    {/* 3. Privacy & Security */}
                    <section className="bg-[#1a1429] border border-white/5 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                            <h3 className="font-bold text-white flex items-center">
                                <Lock className="w-5 h-5 mr-2 text-teal-400" /> Privacy & Security
                            </h3>
                        </div>
                        <div className="p-6 divide-y divide-white/5">
                            <Toggle
                                label="Share Data with Counselor"
                                description="Allow your assigned specialist to view your risk logs."
                                checked={privacy.shareWithCounselor}
                                onChange={() => setPrivacy({ ...privacy, shareWithCounselor: !privacy.shareWithCounselor })}
                            />
                            <Toggle
                                label="Biometric Login"
                                description="Use FaceID/TouchID to access the app."
                                checked={privacy.biometricLogin}
                                onChange={() => setPrivacy({ ...privacy, biometricLogin: !privacy.biometricLogin })}
                            />

                            <div className="py-4">
                                <button onClick={handleDownloadData} className="flex items-center text-slate-300 hover:text-white transition-colors">
                                    <Download className="w-4 h-4 mr-2" /> Download My Data (GDPR Copy)
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* 4. Danger Zone */}
                    <section className="bg-[#1a1429] border border-red-500/20 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/5 bg-red-900/10">
                            <h3 className="font-bold text-red-400 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2" /> Danger Zone
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-colors"
                            >
                                <LogOut className="w-5 h-5 mr-2" /> Log Out
                            </button>

                            <button
                                onClick={handleDeleteAccount}
                                className="w-full flex items-center justify-center px-4 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 font-bold rounded-xl border border-red-500/20 transition-colors"
                            >
                                <Trash2 className="w-5 h-5 mr-2" /> Delete Account
                            </button>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default Settings;
