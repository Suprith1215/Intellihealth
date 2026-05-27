import React, { useState, useEffect } from 'react';
import { Mail, MessageCircle, Phone, Calendar, Clock, Send, Download, CheckCircle, Settings as SettingsIcon, Shield } from 'lucide-react';
import { weeklyReportService, ReportSettings, WeeklyReportData } from '../services/weeklyReportService';

const WeeklyReportSetup: React.FC = () => {
    const [settings, setSettings] = useState<ReportSettings>({
        enabled: false,
        shareMethod: 'email',
        recipientContact: '',
        reportDay: 1, // Monday
        reportTime: '09:00',
        firstManualReportSent: false,
        consentGiven: false
    });

    const [reportData, setReportData] = useState<WeeklyReportData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        const stored = weeklyReportService.getReportSettings();
        if (stored) {
            setSettings(stored);
        }
    }, []);

    const handleSaveSettings = () => {
        weeklyReportService.saveReportSettings(settings);
        alert('Settings saved successfully!');
    };

    const handleGeneratePreview = async () => {
        setIsGenerating(true);
        try {
            const data = await weeklyReportService.generateReportData();
            setReportData(data);
            setShowPreview(true);
        } catch (error) {
            alert('Error generating report preview');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadReport = async () => {
        if (!reportData) return;

        try {
            await weeklyReportService.downloadReport(reportData);
        } catch (error) {
            alert('Error downloading report');
        }
    };

    const handleSendManualReport = async () => {
        if (!reportData || !settings.recipientContact || !settings.consentGiven) {
            alert('Please fill all fields and give consent before sending');
            return;
        }

        setIsSending(true);
        try {
            const success = await weeklyReportService.shareReport(
                reportData,
                settings.shareMethod,
                settings.recipientContact
            );

            if (success) {
                // Mark first manual report as sent
                const updatedSettings = {
                    ...settings,
                    firstManualReportSent: true,
                    lastReportDate: new Date()
                };
                setSettings(updatedSettings);
                weeklyReportService.saveReportSettings(updatedSettings);
                alert('Report sent successfully! Automatic weekly reports are now enabled.');
            }
        } catch (error) {
            alert('Error sending report');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0c] via-[#1a0b2e] to-[#2a1157] p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <SettingsIcon className="w-8 h-8 text-purple-400" />
                        <h1 className="text-3xl font-black text-white">Weekly Report Setup</h1>
                    </div>
                    <p className="text-slate-400">Configure automated weekly recovery reports</p>
                </div>

                {/* Main Setup Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl mb-6">

                    {/* Share Method Selection */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-white mb-4">Sharing Method</label>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => setSettings({ ...settings, shareMethod: 'email' })}
                                className={`p-4 rounded-xl border-2 transition-all ${settings.shareMethod === 'email'
                                        ? 'border-purple-500 bg-purple-500/20'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <Mail className={`w-8 h-8 mx-auto mb-2 ${settings.shareMethod === 'email' ? 'text-purple-400' : 'text-slate-400'}`} />
                                <p className={`text-sm font-bold ${settings.shareMethod === 'email' ? 'text-white' : 'text-slate-400'}`}>Email</p>
                            </button>

                            <button
                                onClick={() => setSettings({ ...settings, shareMethod: 'whatsapp' })}
                                className={`p-4 rounded-xl border-2 transition-all ${settings.shareMethod === 'whatsapp'
                                        ? 'border-green-500 bg-green-500/20'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <MessageCircle className={`w-8 h-8 mx-auto mb-2 ${settings.shareMethod === 'whatsapp' ? 'text-green-400' : 'text-slate-400'}`} />
                                <p className={`text-sm font-bold ${settings.shareMethod === 'whatsapp' ? 'text-white' : 'text-slate-400'}`}>WhatsApp</p>
                            </button>

                            <button
                                onClick={() => setSettings({ ...settings, shareMethod: 'sms' })}
                                className={`p-4 rounded-xl border-2 transition-all ${settings.shareMethod === 'sms'
                                        ? 'border-blue-500 bg-blue-500/20'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <Phone className={`w-8 h-8 mx-auto mb-2 ${settings.shareMethod === 'sms' ? 'text-blue-400' : 'text-slate-400'}`} />
                                <p className={`text-sm font-bold ${settings.shareMethod === 'sms' ? 'text-white' : 'text-slate-400'}`}>SMS</p>
                            </button>
                        </div>
                    </div>

                    {/* Recipient Contact */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-white mb-2">
                            {settings.shareMethod === 'email' ? 'Email Address' : 'Phone Number'}
                        </label>
                        <input
                            type={settings.shareMethod === 'email' ? 'email' : 'tel'}
                            value={settings.recipientContact}
                            onChange={(e) => setSettings({ ...settings, recipientContact: e.target.value })}
                            placeholder={settings.shareMethod === 'email' ? 'doctor@example.com' : '+1234567890'}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                    </div>

                    {/* Schedule Settings */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Report Day
                            </label>
                            <select
                                value={settings.reportDay}
                                onChange={(e) => setSettings({ ...settings, reportDay: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                            >
                                {days.map((day, index) => (
                                    <option key={index} value={index} className="bg-[#1a0b2e]">{day}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Report Time
                            </label>
                            <input
                                type="time"
                                value={settings.reportTime}
                                onChange={(e) => setSettings({ ...settings, reportTime: e.target.value })}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Consent Checkbox */}
                    <div className="mb-8 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.consentGiven}
                                onChange={(e) => setSettings({ ...settings, consentGiven: e.target.checked })}
                                className="mt-1 w-5 h-5 rounded border-purple-500 text-purple-600 focus:ring-purple-500"
                            />
                            <div>
                                <p className="text-white font-bold mb-1 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-purple-400" />
                                    Privacy Consent
                                </p>
                                <p className="text-sm text-slate-300">
                                    I authorize IntelliHeal to send my weekly recovery report automatically to the specified recipient.
                                    I understand this report contains sensitive health information.
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Enable Toggle */}
                    {settings.firstManualReportSent && (
                        <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                            <label className="flex items-center justify-between cursor-pointer">
                                <div>
                                    <p className="text-white font-bold">Enable Automatic Reports</p>
                                    <p className="text-sm text-slate-400">Send reports automatically every week</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settings.enabled}
                                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                                    className="w-12 h-6 rounded-full"
                                />
                            </label>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleSaveSettings}
                            className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
                        >
                            Save Settings
                        </button>

                        <button
                            onClick={handleGeneratePreview}
                            disabled={isGenerating}
                            className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5" />
                                    Preview Report
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Report Preview */}
                {showPreview && reportData && (
                    <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                        <h2 className="text-2xl font-black text-white mb-6">Report Preview</h2>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="bg-white/5 p-4 rounded-xl">
                                <p className="text-slate-400 text-sm mb-1">Recovery Score</p>
                                <p className="text-4xl font-black text-green-400">{reportData.recoveryScore}%</p>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl">
                                <p className="text-slate-400 text-sm mb-1">Risk Category</p>
                                <p className={`text-2xl font-black ${reportData.riskCategory === 'Low' ? 'text-green-400' :
                                        reportData.riskCategory === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                                    }`}>{reportData.riskCategory}</p>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl">
                                <p className="text-slate-400 text-sm mb-1">Intervention Compliance</p>
                                <p className="text-2xl font-black text-white">{reportData.interventionCompliance}%</p>
                            </div>

                            <div className="bg-white/5 p-4 rounded-xl">
                                <p className="text-slate-400 text-sm mb-1">Music Therapy</p>
                                <p className="text-2xl font-black text-white">{reportData.musicTherapyMinutes} min</p>
                            </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl mb-6">
                            <p className="text-slate-400 text-sm mb-2">AI Summary</p>
                            <p className="text-white">{reportData.aiSummary}</p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleDownloadReport}
                                className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Download PDF
                            </button>

                            <button
                                onClick={handleSendManualReport}
                                disabled={isSending || !settings.consentGiven || !settings.recipientContact}
                                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Report Now
                                    </>
                                )}
                            </button>
                        </div>

                        {settings.firstManualReportSent && (
                            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-400" />
                                <div>
                                    <p className="text-white font-bold">Automatic Reports Enabled</p>
                                    <p className="text-sm text-slate-300">
                                        Reports will be sent every {days[settings.reportDay]} at {settings.reportTime}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeeklyReportSetup;
