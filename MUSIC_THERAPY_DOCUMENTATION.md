# Music Therapy Module - Technical Documentation

## Overview
The Music Therapy module is a mood-based therapeutic intervention tool integrated into the IntelliHeal addiction recovery platform. It uses adaptive music recommendations to support emotional regulation, reduce cravings, and improve overall mental well-being during recovery.

---

## Core Features

### 1. Smart Mood Detection
- **Automatic Detection**: Analyzes existing system data (risk scores, sentiment analysis) to infer current emotional state
- **Manual Selection**: Users can manually select from 6 mood categories:
  - 🌊 **Calm & Peaceful** - For relaxation and stress reduction
  - 😔 **Feeling Down** - For emotional support during low periods
  - 😰 **Anxious & Restless** - For anxiety management
  - 💪 **Motivated & Energized** - For motivation and energy boost
  - 😴 **Low Energy** - For gentle uplift and comfort
  - 🎯 **Need Focus** - For concentration and mental clarity

### 2. Adaptive Music Library
The module includes 15+ curated tracks across 5 categories:

#### Devotional (Telugu)
- Om Namah Shivaya - S.P. Balasubrahmanyam
- Govinda Namalu - M.S. Subbulakshmi
- Hanuman Chalisa - Hariharan

#### Motivational (Telugu)
- Nuvve Nuvve - Karthik
- Osey Ramulamma - Mano
- Poolane Kunukeyamantaa - S.P. Balasubrahmanyam

#### BGM (Background Music)
- Arjun Reddy Theme - Radhan
- Baahubali Theme - M.M. Keeravani
- Magadheera Love Theme - M.M. Keeravani

#### Lo-fi / Instrumental
- Telugu Lo-fi Beats Vol.1
- Veena Instrumental - E. Gayathri
- Flute Meditation - Pandit Hariprasad Chaurasia

#### Ambient / Nature Sounds
- Rain & Thunder
- Ocean Waves
- Forest Birds

### 3. Integrated Music Player
**Features:**
- ▶️ Play/Pause controls
- ⏭️ Skip to next track
- 🔊 Volume control with mute
- ❤️ Favorite tracks
- 📊 Progress bar with time display
- 🎵 Visual waveform animation (mood-adaptive colors)

**Design:**
- Glassmorphism UI with medical-grade aesthetics
- Mood-adaptive color gradients
- Smooth fade transitions between tracks
- Non-intrusive, calming interface

### 4. Emotional Feedback Loop
After each session, users are prompted:
- **"How did this session help you?"**
  - 😊 Helpful
  - 😐 Neutral
  - ☹️ Not Helpful

This feedback is used to:
- Improve future recommendations
- Track therapy effectiveness
- Personalize the music selection algorithm

### 5. Safety & Ethical Design

#### Session Management
- **Gentle Reminders**: After 30 minutes of continuous listening
- **No Autoplay Loops**: Prevents addictive behavior patterns
- **Session Tracking**: Monitors duration for clinical insights

#### Privacy
- All session data stored locally
- No external music streaming (in production, would use secure APIs)
- HIPAA-compliant data handling

---

## Technical Implementation

### Component Structure
```
MusicTherapy.tsx
├── Mood Selection Screen
├── Music Player Interface
└── Feedback Modal
```

### State Management
```typescript
- selectedMood: MoodType | null
- currentTrack: Track | null
- isPlaying: boolean
- volume: number (0-100)
- progress: number (0-100)
- playlist: Track[]
- sessionDuration: number (seconds)
- favorites: string[]
```

### Key Functions

#### `detectMoodFromSystem()`
Analyzes user's risk assessment and returns suggested mood:
- Risk Score > 70 → Anxious
- Risk Score < 30 → Calm
- Default → Calm (therapeutic default)

#### `generatePlaylist(mood: MoodType)`
Creates a personalized 10-track playlist based on:
- Mood matching
- Track variety
- Randomization for freshness

#### `handleFeedback(feedback)`
Saves session data including:
- Start time
- Mood selected
- Tracks played
- User feedback
- Total duration

---

## Integration Points

### 1. Dashboard Integration
**Location**: Real-Time Intervention section
**Trigger**: Appears during high-risk periods (craving markers detected)
**Action**: Quick access button navigates to Music Therapy module

### 2. Navigation Menu
**Location**: Main sidebar
**Icon**: 🎧 Headphones
**Position**: Between "Therapy" and "Clinician Portal"

### 3. Recovery Timeline
Music therapy sessions are logged as recovery activities alongside:
- Journal entries
- Therapy sessions
- Medication tracking
- Exercise logs

---

## User Flow

### First-Time User
1. **Entry**: Click "Music Therapy" from sidebar or dashboard intervention
2. **Mood Detection**: System suggests mood based on current state
3. **Mood Selection**: User confirms or selects different mood
4. **Playlist Generation**: 10 tracks curated for selected mood
5. **Playback**: Integrated player with controls
6. **Session End**: Feedback prompt after playlist completion
7. **Return**: Option to start new session or return to dashboard

### Returning User
- Favorites are remembered
- Previous feedback influences recommendations
- Session history tracked for progress monitoring

---

## Clinical Rationale

### Evidence-Based Benefits
1. **Stress Reduction**: Music therapy reduces cortisol levels
2. **Mood Regulation**: Helps stabilize emotional states
3. **Craving Management**: Provides distraction during urges
4. **Neuroplasticity**: Supports brain recovery through auditory stimulation
5. **Cultural Connection**: Telugu songs provide cultural familiarity and comfort

### Therapeutic Approach
- **Non-invasive**: No medication or physical intervention
- **Accessible**: Available 24/7 without appointments
- **Complementary**: Works alongside other recovery tools
- **Personalized**: Adapts to individual emotional needs

---

## Future Enhancements

### Phase 2 Features
1. **Real Audio Integration**
   - Spotify/YouTube Music API
   - Offline download capability
   - Higher quality audio streaming

2. **Advanced Personalization**
   - Machine learning recommendation engine
   - User preference learning
   - Collaborative filtering

3. **Biometric Integration**
   - Heart rate monitoring during playback
   - Stress level tracking
   - Real-time mood adjustment

4. **Social Features**
   - Shared playlists (anonymized)
   - Community favorites
   - Therapist-curated collections

5. **Extended Library**
   - Multiple languages (Hindi, Tamil, English)
   - More genres (classical, jazz, meditation)
   - User-uploaded tracks (moderated)

### Phase 3 Features
1. **Live Sessions**
   - Virtual music therapy groups
   - Professional music therapist guidance
   - Interactive sessions

2. **Analytics Dashboard**
   - Mood trends over time
   - Most effective tracks
   - Session frequency insights

---

## API Endpoints (Future)

### GET /api/music/recommendations
**Parameters:**
- `mood`: MoodType
- `riskLevel`: number
- `userId`: string

**Response:**
```json
{
  "playlist": [
    {
      "id": "track_123",
      "title": "Om Namah Shivaya",
      "artist": "S.P. Balasubrahmanyam",
      "url": "https://...",
      "duration": 240
    }
  ]
}
```

### POST /api/music/feedback
**Body:**
```json
{
  "sessionId": "session_123",
  "mood": "calm",
  "feedback": "helpful",
  "duration": 1800,
  "tracksPlayed": ["track_1", "track_2"]
}
```

---

## Accessibility

### Keyboard Navigation
- Space: Play/Pause
- Arrow Right: Next track
- Arrow Up/Down: Volume control
- F: Toggle favorite

### Screen Reader Support
- All controls have ARIA labels
- Track information announced
- Progress updates

### Visual Accessibility
- High contrast mode support
- Color-blind friendly gradients
- Large touch targets (48px minimum)

---

## Performance Considerations

### Optimization
- Lazy loading of track metadata
- Progressive audio loading
- Efficient state updates
- Debounced volume changes

### Memory Management
- Cleanup of timers on unmount
- Audio buffer management
- Session data compression

---

## Testing Checklist

### Functional Tests
- ✅ Mood detection accuracy
- ✅ Playlist generation
- ✅ Player controls (play, pause, skip)
- ✅ Volume control
- ✅ Favorite persistence
- ✅ Feedback submission
- ✅ Session timer accuracy

### UI/UX Tests
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Animation smoothness
- ✅ Color contrast ratios
- ✅ Touch target sizes
- ✅ Loading states

### Integration Tests
- ✅ Dashboard navigation
- ✅ Sidebar menu integration
- ✅ Toast notifications
- ✅ Database persistence

---

## Deployment Notes

### Environment Variables
```env
MUSIC_API_KEY=your_api_key_here
MUSIC_API_URL=https://api.musicservice.com
MAX_SESSION_DURATION=3600
```

### Dependencies
- `lucide-react`: Icons
- `react`: Core framework
- Toast context for notifications
- Database service for persistence

---

## Support & Maintenance

### Monitoring
- Track session completion rates
- Monitor feedback distribution
- Analyze most popular tracks
- Identify technical issues

### Updates
- Monthly playlist refreshes
- Quarterly feature additions
- Continuous UX improvements

---

## Conclusion

The Music Therapy module represents a holistic approach to addiction recovery, leveraging the therapeutic power of music to support emotional regulation and mental well-being. By combining evidence-based practices with modern technology and cultural sensitivity, it provides a valuable tool in the comprehensive recovery toolkit.

**Status**: ✅ Production Ready (Mock Data)
**Next Steps**: Integrate real audio streaming APIs
**Maintenance**: Monthly content updates recommended
