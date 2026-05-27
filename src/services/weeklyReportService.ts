// Weekly Report Service
// Handles report generation, scheduling, and sharing

import { jsPDF } from 'jspdf';

export interface WeeklyReportData {
    userName: string;
    weekStart: Date;
    weekEnd: Date;
    relapseRiskTrend: number[];
    cravingIntensity: number[];
    moodScores: number[];
    interventionCompliance: number;
    musicTherapyMinutes: number;
    recoveryScore: number;
    riskCategory: 'Low' | 'Medium' | 'High';
    aiSummary: string;
    therapistNotes?: string;
}

export interface ReportSettings {
    enabled: boolean;
    shareMethod: 'email' | 'whatsapp' | 'sms';
    recipientContact: string;
    reportDay: number; // 0-6 (Sunday-Saturday)
    reportTime: string; // HH:MM format
    firstManualReportSent: boolean;
    consentGiven: boolean;
    lastReportDate?: Date;
}

class WeeklyReportService {
    private STORAGE_KEY = 'intelliheal_report_settings';

    /**
     * Get user's report settings
     */
    getReportSettings(): ReportSettings | null {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) return null;

        const settings = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (settings.lastReportDate) {
            settings.lastReportDate = new Date(settings.lastReportDate);
        }
        return settings;
    }

    /**
     * Save report settings
     */
    saveReportSettings(settings: ReportSettings): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    }

    /**
     * Generate weekly report data from user's activity
     */
    async generateReportData(): Promise<WeeklyReportData> {
        // Get current week range
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);

        // In production, fetch real data from database
        // For now, generate mock data based on stored user activity
        const userData = this.getUserData();

        return {
            userName: userData.name || 'User',
            weekStart,
            weekEnd: today,
            relapseRiskTrend: this.calculateRelapseRisk(),
            cravingIntensity: this.calculateCravingIntensity(),
            moodScores: this.calculateMoodScores(),
            interventionCompliance: this.calculateCompliance(),
            musicTherapyMinutes: this.getMusicTherapyUsage(),
            recoveryScore: this.calculateRecoveryScore(),
            riskCategory: this.determineRiskCategory(),
            aiSummary: this.generateAISummary(),
            therapistNotes: userData.therapistNotes
        };
    }

    /**
     * Generate PDF report
     */
    async generatePDF(data: WeeklyReportData): Promise<Blob> {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(42, 17, 87); // Purple background
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('IntelliHeal', 20, 20);

        doc.setFontSize(16);
        doc.text('Weekly Recovery Report', 20, 32);

        // Patient Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Patient: ${data.userName}`, 20, 50);
        doc.text(`Report Period: ${this.formatDate(data.weekStart)} - ${this.formatDate(data.weekEnd)}`, 20, 57);

        // Recovery Score (Large Circle)
        doc.setFontSize(36);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(76, 175, 80); // Green
        doc.text(`${data.recoveryScore}%`, 30, 85);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Recovery Score', 25, 92);

        // Risk Category
        const riskColor = data.riskCategory === 'Low' ? [76, 175, 80] :
            data.riskCategory === 'Medium' ? [255, 152, 0] : [244, 67, 54];
        doc.setFillColor(...riskColor);
        doc.roundedRect(20, 100, 50, 12, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Risk: ${data.riskCategory}`, 30, 108);

        // Metrics Section
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Weekly Metrics', 20, 125);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let yPos = 135;

        // Intervention Compliance
        doc.text(`Intervention Compliance: ${data.interventionCompliance}%`, 20, yPos);
        this.drawProgressBar(doc, 100, yPos - 3, data.interventionCompliance);
        yPos += 15;

        // Music Therapy Usage
        doc.text(`Music Therapy: ${data.musicTherapyMinutes} minutes`, 20, yPos);
        yPos += 10;

        // Average Mood
        const avgMood = data.moodScores.reduce((a, b) => a + b, 0) / data.moodScores.length;
        doc.text(`Average Mood: ${avgMood.toFixed(1)}/10`, 20, yPos);
        yPos += 10;

        // Average Craving
        const avgCraving = data.cravingIntensity.reduce((a, b) => a + b, 0) / data.cravingIntensity.length;
        doc.text(`Average Craving Intensity: ${avgCraving.toFixed(1)}/10`, 20, yPos);
        yPos += 15;

        // AI Summary
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('AI-Generated Summary', 20, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(data.aiSummary, 170);
        doc.text(summaryLines, 20, yPos);
        yPos += summaryLines.length * 5 + 10;

        // Therapist Notes
        if (data.therapistNotes) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Therapist Notes', 20, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const notesLines = doc.splitTextToSize(data.therapistNotes, 170);
            doc.text(notesLines, 20, yPos);
            yPos += notesLines.length * 5 + 10;
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('CONFIDENTIAL - This report contains sensitive health information', 20, 280);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 285);
        doc.text('IntelliHeal - AI-Based Drug Addiction Recovery System', 20, 290);

        return doc.output('blob');
    }

    /**
     * Download PDF report
     */
    async downloadReport(data: WeeklyReportData): Promise<void> {
        const pdf = await this.generatePDF(data);
        const url = URL.createObjectURL(pdf);
        const link = document.createElement('a');
        link.href = url;
        link.download = `IntelliHeal_Report_${this.formatDate(data.weekEnd)}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Share report via selected method
     */
    async shareReport(data: WeeklyReportData, method: 'email' | 'whatsapp' | 'sms', recipient: string): Promise<boolean> {
        const pdf = await this.generatePDF(data);

        switch (method) {
            case 'email':
                return this.shareViaEmail(pdf, recipient, data);
            case 'whatsapp':
                return this.shareViaWhatsApp(pdf, recipient, data);
            case 'sms':
                return this.shareViaSMS(recipient, data);
            default:
                return false;
        }
    }

    /**
     * Share via Email (mock - would use SendGrid/SMTP in production)
     */
    private async shareViaEmail(pdf: Blob, email: string, data: WeeklyReportData): Promise<boolean> {
        // In production, send to backend API that uses SendGrid
        console.log('Sending email to:', email);
        console.log('PDF size:', pdf.size, 'bytes');

        // Mock success
        return new Promise((resolve) => {
            setTimeout(() => {
                alert(`Report would be sent to ${email}\n\nIn production, this would use SendGrid API.`);
                resolve(true);
            }, 1000);
        });
    }

    /**
     * Share via WhatsApp (mock - would use Twilio in production)
     */
    private async shareViaWhatsApp(pdf: Blob, phone: string, data: WeeklyReportData): Promise<boolean> {
        // In production, send to backend API that uses Twilio WhatsApp API
        console.log('Sending WhatsApp to:', phone);

        // For now, open WhatsApp Web with message
        const message = `Here is your weekly IntelliHeal recovery report for ${this.formatDate(data.weekStart)} - ${this.formatDate(data.weekEnd)}`;
        const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        return true;
    }

    /**
     * Share via SMS (mock - would use Twilio in production)
     */
    private async shareViaSMS(phone: string, data: WeeklyReportData): Promise<boolean> {
        // In production, send to backend API that uses Twilio SMS
        const message = `Your IntelliHeal weekly report is ready. Recovery Score: ${data.recoveryScore}%. Check your email for the full report.`;

        alert(`SMS would be sent to ${phone}:\n\n${message}\n\nIn production, this would use Twilio SMS API.`);
        return true;
    }

    /**
     * Check if report should be sent today
     */
    shouldSendReportToday(settings: ReportSettings): boolean {
        if (!settings.enabled || !settings.firstManualReportSent) {
            return false;
        }

        const today = new Date();
        const dayMatches = today.getDay() === settings.reportDay;

        // Check if already sent today
        if (settings.lastReportDate) {
            const lastSent = new Date(settings.lastReportDate);
            const sameDay = lastSent.toDateString() === today.toDateString();
            if (sameDay) return false;
        }

        return dayMatches;
    }

    // Helper methods
    private getUserData() {
        const stored = localStorage.getItem('intelliheal_user_v1');
        return stored ? JSON.parse(stored) : { name: 'User' };
    }

    private calculateRelapseRisk(): number[] {
        // Mock data - in production, fetch from database
        return [65, 58, 52, 48, 45, 42, 38];
    }

    private calculateCravingIntensity(): number[] {
        return [7, 6, 5, 6, 4, 3, 3];
    }

    private calculateMoodScores(): number[] {
        return [5, 6, 6, 7, 7, 8, 8];
    }

    private calculateCompliance(): number {
        return 85; // Mock - calculate from actual intervention data
    }

    private getMusicTherapyUsage(): number {
        return 120; // Mock - sum from music therapy logs
    }

    private calculateRecoveryScore(): number {
        return 78; // Mock - calculate from multiple factors
    }

    private determineRiskCategory(): 'Low' | 'Medium' | 'High' {
        const score = this.calculateRecoveryScore();
        if (score >= 70) return 'Low';
        if (score >= 40) return 'Medium';
        return 'High';
    }

    private generateAISummary(): string {
        return "This week shows positive progress in your recovery journey. Your craving intensity has decreased by 57% compared to last week, and your mood scores show consistent improvement. Intervention compliance remains strong at 85%. Continue with your current wellness plan and music therapy sessions. Your risk level has improved to 'Low' category.";
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    private drawProgressBar(doc: jsPDF, x: number, y: number, percentage: number): void {
        // Background
        doc.setFillColor(230, 230, 230);
        doc.rect(x, y, 80, 6, 'F');

        // Progress
        const color = percentage >= 70 ? [76, 175, 80] : percentage >= 40 ? [255, 152, 0] : [244, 67, 54];
        doc.setFillColor(...color);
        doc.rect(x, y, (80 * percentage) / 100, 6, 'F');
    }
}

export const weeklyReportService = new WeeklyReportService();
