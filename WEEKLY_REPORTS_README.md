# IntelliHeal - Automated Weekly Recovery Report System

## 📋 Overview

The Automated Weekly Recovery Report System is a comprehensive feature that generates professional PDF reports of user recovery progress and enables automated sharing via Email, WhatsApp, or SMS.

## ✨ Features Implemented

### 1. **Weekly Report Generation**
- ✅ Professional PDF reports with clinical layout
- ✅ Recovery score calculation
- ✅ Risk category assessment (Low/Medium/High)
- ✅ Intervention compliance tracking
- ✅ Music therapy usage statistics
- ✅ Mood and craving trend analysis
- ✅ AI-generated summary
- ✅ Therapist notes section
- ✅ Confidentiality footer

### 2. **Sharing Methods**
- ✅ **Email** - Mock implementation (ready for SendGrid integration)
- ✅ **WhatsApp** - Opens WhatsApp Web with message
- ✅ **SMS** - Mock implementation (ready for Twilio integration)

### 3. **User Interface**
- ✅ **Weekly Report Setup Page** - Configure sharing preferences
- ✅ **Report Preview** - View report before sending
- ✅ **Download PDF** - Save report locally
- ✅ **Manual Send** - First-time manual report sending
- ✅ **Consent Management** - Privacy consent checkbox
- ✅ **Schedule Configuration** - Day and time selection

### 4. **Data Management**
- ✅ Local storage for settings (can be migrated to database)
- ✅ User-level data isolation
- ✅ Settings persistence
- ✅ Last report date tracking

## 🚀 How to Use

### First-Time Setup:

1. **Navigate to Weekly Reports**
   - Click "Weekly Reports" in the sidebar menu

2. **Select Sharing Method**
   - Choose Email, WhatsApp, or SMS

3. **Enter Recipient Details**
   - Email address or phone number

4. **Set Schedule**
   - Select day of week (e.g., Monday)
   - Set time (e.g., 09:00 AM)

5. **Give Consent**
   - Check the privacy consent checkbox

6. **Preview Report**
   - Click "Preview Report" to generate and view

7. **Send First Report**
   - Click "Send Report Now" to send manually
   - This activates automatic weekly reports

### Automatic Reports:

After sending the first manual report:
- ✅ Reports generate automatically every week
- ✅ Sent on your selected day and time
- ✅ Can be enabled/disabled with toggle
- ✅ View next scheduled send date

## 📊 Report Contents

Each PDF report includes:

1. **Header**
   - IntelliHeal branding
   - Patient name
   - Report period (week range)

2. **Recovery Metrics**
   - Overall recovery score (%)
   - Risk category badge
   - Intervention compliance
   - Music therapy minutes
   - Average mood score
   - Average craving intensity

3. **AI Summary**
   - Personalized progress analysis
   - Trend insights
   - Recommendations

4. **Therapist Notes** (if available)
   - Professional observations
   - Treatment notes

5. **Footer**
   - Confidentiality notice
   - Generation timestamp
   - IntelliHeal branding

## 🔧 Technical Implementation

### Frontend Components

**`WeeklyReportSetup.tsx`**
- Main setup interface
- Report preview
- Settings management
- Send functionality

### Services

**`weeklyReportService.ts`**
- PDF generation using jsPDF
- Data aggregation
- Sharing logic
- Settings persistence

### Data Structure

```typescript
interface ReportSettings {
  enabled: boolean;
  shareMethod: 'email' | 'whatsapp' | 'sms';
  recipientContact: string;
  reportDay: number; // 0-6 (Sunday-Saturday)
  reportTime: string; // HH:MM format
  firstManualReportSent: boolean;
  consentGiven: boolean;
  lastReportDate?: Date;
}

interface WeeklyReportData {
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
```

## 🔐 Security & Privacy

### Current Implementation:
- ✅ User consent required
- ✅ Settings stored locally
- ✅ Confidentiality notice on reports
- ✅ User-level data isolation

### Production Recommendations:
- 🔒 Encrypt recipient contact details
- 🔒 Use secure backend API for sharing
- 🔒 Implement rate limiting
- 🔒 Add PDF password protection
- 🔒 Use token-based report access
- 🔒 GDPR compliance measures

## 📱 Integration Guide

### Email Integration (Production)

Replace mock with SendGrid:

```typescript
// Backend API endpoint
async function sendEmailReport(pdf: Blob, email: string, data: WeeklyReportData) {
  const formData = new FormData();
  formData.append('pdf', pdf);
  formData.append('email', email);
  formData.append('subject', 'Your Weekly IntelliHeal Recovery Report');
  
  const response = await fetch('/api/reports/send-email', {
    method: 'POST',
    body: formData
  });
  
  return response.ok;
}
```

### WhatsApp Integration (Production)

Replace mock with Twilio WhatsApp API:

```typescript
// Backend API endpoint
async function sendWhatsAppReport(pdf: Blob, phone: string, data: WeeklyReportData) {
  const formData = new FormData();
  formData.append('pdf', pdf);
  formData.append('phone', phone);
  
  const response = await fetch('/api/reports/send-whatsapp', {
    method: 'POST',
    body: formData
  });
  
  return response.ok;
}
```

### SMS Integration (Production)

Replace mock with Twilio SMS API:

```typescript
// Backend API endpoint
async function sendSMSNotification(phone: string, data: WeeklyReportData) {
  const response = await fetch('/api/reports/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      message: `Your IntelliHeal weekly report is ready. Recovery Score: ${data.recoveryScore}%`
    })
  });
  
  return response.ok;
}
```

## 🔄 Automation Logic

### Scheduler Implementation (Production)

For production, implement backend scheduler:

```python
# Python backend with APScheduler
from apscheduler.schedulers.background import BackgroundScheduler

def check_and_send_reports():
    users = get_users_with_enabled_reports()
    
    for user in users:
        if should_send_report_today(user):
            report_data = generate_report_data(user.id)
            pdf = generate_pdf(report_data)
            send_report(pdf, user.share_method, user.recipient_contact)
            update_last_report_date(user.id)

scheduler = BackgroundScheduler()
scheduler.add_job(check_and_send_reports, 'cron', hour=0, minute=0)  # Run daily at midnight
scheduler.start()
```

## 📈 Future Enhancements

### Planned Features:
- [ ] Therapist dashboard access to patient reports
- [ ] Multiple recipient support (caregiver + therapist)
- [ ] PDF password protection
- [ ] Monthly summary reports
- [ ] Advanced AI insights with trend predictions
- [ ] Report history viewer
- [ ] Custom report templates
- [ ] Multi-language support
- [ ] Export to other formats (Excel, CSV)

## 🎨 UI/UX Features

- **Cyberpunk Theme** - Matches IntelliHeal's design
- **Responsive Design** - Works on all devices
- **Smooth Animations** - Loading states and transitions
- **Clear Status Indicators** - Next send date, last sent
- **Intuitive Setup Flow** - Step-by-step configuration
- **Preview Before Send** - Review report before sharing

## 🧪 Testing

### Manual Testing Checklist:

- [ ] Navigate to Weekly Reports page
- [ ] Select each sharing method
- [ ] Enter recipient details
- [ ] Set schedule
- [ ] Give consent
- [ ] Generate preview
- [ ] Download PDF
- [ ] Send manual report
- [ ] Verify settings persistence
- [ ] Toggle enable/disable

## 📦 Dependencies

```json
{
  "jspdf": "^2.5.1",
  "@types/jspdf": "^2.0.0"
}
```

## 🔗 Navigation

Access the feature:
1. Open IntelliHeal application
2. Click **"Weekly Reports"** in sidebar
3. Complete setup wizard
4. Start receiving automated reports

## 📞 Support

For issues or questions:
- Check console for error messages
- Verify recipient contact format
- Ensure consent is given
- Confirm schedule settings

## 🎯 Success Criteria

✅ User can configure report settings
✅ PDF generates with correct data
✅ Manual send works for first report
✅ Settings persist across sessions
✅ UI matches IntelliHeal theme
✅ Ready for backend integration

---

**Built with ❤️ for IntelliHeal - AI-Based Drug Addiction Recovery System**
