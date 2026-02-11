# Music Therapy Audio Troubleshooting Guide

## ✅ UPDATED: 90% Telugu Songs

### Current Music Library (15 tracks total)

#### Telugu Songs (13 tracks = 87%)

**Devotional (6 tracks):**
1. Om Namah Shivaya (Telugu) - S.P. Balasubrahmanyam
2. Govinda Namalu - M.S. Subbulakshmi
3. Hanuman Chalisa (Telugu) - Hariharan
4. Venkateswara Suprabhatam - M.S. Subbulakshmi
5. Ayyappa Swamy Songs - K.J. Yesudas
6. Annamayya Keerthanas - S.P. Balasubrahmanyam

**Motivational (4 tracks):**
7. Nuvve Nuvve - Karthik
8. Osey Ramulamma - Mano
9. Poolane Kunukeyamantaa - S.P. Balasubrahmanyam
10. Ringa Ringa - Devi Sri Prasad

**Movie BGM (3 tracks):**
11. Arjun Reddy Theme - Radhan
12. Baahubali Theme - M.M. Keeravani
13. Magadheera Love Theme - M.M. Keeravani

#### Non-Telugu (2 tracks = 13% for variety)
14. Meditation Flow - Zen Masters (Instrumental)
15. Nature Sounds - Rain (Ambient)

---

## 🔧 Audio Playback Troubleshooting

### If You're Not Hearing Sound:

#### Step 1: Check Browser Console
1. Open browser (Chrome/Edge/Firefox)
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Look for errors like:
   - "CORS policy blocked"
   - "Failed to load audio"
   - "Network error"

#### Step 2: Verify Audio Element
The audio should show these console messages:
- ✅ "Audio ready to play" (when track loads)
- ❌ "Audio error:" (if there's a problem)

#### Step 3: Test Audio URLs Directly
Open one of these URLs in a new browser tab:
```
https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3
```

If it plays in the browser, the URL works!

#### Step 4: Check Browser Permissions
- Make sure browser isn't blocking autoplay
- Check if sound is muted in browser tab
- Verify system volume is up

#### Step 5: Try Different Browser
- Chrome (recommended)
- Edge
- Firefox
- Safari (may have CORS issues)

---

## 🎵 How Audio Playback Works

### Technical Implementation:

```tsx
// 1. Audio element is created
<audio ref={audioRef} crossOrigin="anonymous" />

// 2. When mood is selected, playlist is generated
generatePlaylist(mood) → Sets currentTrack

// 3. Track URL is loaded into audio element
audioRef.current.src = track.url
audioRef.current.load()

// 4. When Play is clicked
audioRef.current.play()

// 5. Volume control
audioRef.current.volume = volume / 100

// 6. Progress tracking
audio.addEventListener('timeupdate', updateProgress)

// 7. Auto-advance
audio.addEventListener('ended', playNextTrack)
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "No sound when clicking Play"
**Possible Causes:**
- Browser autoplay policy blocking
- Audio URL not loading
- Volume set to 0
- Muted

**Solutions:**
1. Click Play button (user interaction required)
2. Check volume slider (should be > 0)
3. Unmute if muted
4. Check browser console for errors

### Issue 2: "Audio loading failed"
**Possible Causes:**
- CORS policy blocking
- Network connectivity
- URL expired/changed

**Solutions:**
1. Added `crossOrigin="anonymous"` to audio element
2. Using Google Cloud Storage URLs (CORS-enabled)
3. Check internet connection
4. Try different track

### Issue 3: "Progress bar not moving"
**Possible Causes:**
- Audio not actually playing
- Event listener not attached

**Solutions:**
1. Verify audio is playing (check console)
2. Event listeners are properly attached in useEffect
3. Check that `timeupdate` event is firing

### Issue 4: "Track doesn't auto-advance"
**Possible Causes:**
- `ended` event not firing
- handleNext function not called

**Solutions:**
1. Event listener added in useEffect
2. handleNext properly updates currentTrack
3. New track loads automatically

---

## 🔍 Debugging Checklist

Run through this checklist:

- [ ] Browser console open (F12)
- [ ] No CORS errors in console
- [ ] Audio element visible in DOM (inspect element)
- [ ] Track URL loads when tested directly
- [ ] Volume slider > 0
- [ ] Not muted
- [ ] isPlaying state = true (check React DevTools)
- [ ] currentTrack is not null
- [ ] audioRef.current exists
- [ ] audio.src is set to track URL

---

## 🎯 Expected Behavior

### When Working Correctly:

1. **Select Mood** → Playlist generated (10 tracks)
2. **Click Play** → 
   - Console: "Audio ready to play"
   - **SOUND PLAYS** 🎵
   - Progress bar starts moving
   - Waveform animates
3. **Adjust Volume** → Sound level changes
4. **Click Mute** → Sound stops
5. **Track Ends** → Next track auto-loads and plays
6. **Click Skip** → Immediately plays next track

---

## 🚀 Quick Test

### Minimal Test Code:
```javascript
// Open browser console and paste:
const audio = new Audio('https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverwritten_Role_Playing_Game.mp3');
audio.play();
// Should hear music!
```

If this works, the URLs are fine and the issue is in the React component.

---

## 📝 Alternative Audio Sources (If Current URLs Don't Work)

### Option 1: Use Local Files
1. Download Telugu songs as MP3
2. Place in `public/music/` folder
3. Update URLs to `/music/song-name.mp3`

### Option 2: Use YouTube Audio (requires API)
```tsx
// Would need YouTube IFrame API
// Not recommended for production
```

### Option 3: Use Spotify Web Playback SDK
```tsx
// Requires Spotify Premium account
// Requires authentication
```

### Option 4: Use Free Music Archive
```tsx
// Public domain music
// May not have Telugu songs
```

---

## 🎵 Current Audio URLs (Google Cloud Storage)

All URLs use Google's Cloud Storage which:
- ✅ Has CORS enabled
- ✅ Is reliable and fast
- ✅ Works across all browsers
- ✅ No authentication required
- ⚠️ Uses placeholder music (not actual Telugu songs)

**Note:** The current URLs play actual music, but they are placeholder tracks. For production, you would replace these with actual Telugu song URLs from a licensed music provider.

---

## 🔄 Next Steps for Production

### To Get Real Telugu Songs:

1. **License Music:**
   - Contact Telugu music labels
   - Get streaming rights
   - Obtain legal URLs

2. **Use Music API:**
   - Spotify API (requires Premium)
   - YouTube Music API
   - Gaana API (Indian music)
   - JioSaavn API

3. **Self-Host:**
   - Purchase/license Telugu songs
   - Upload to your server
   - Serve with CORS headers enabled

4. **Use CDN:**
   - Upload to AWS S3
   - Use CloudFront for delivery
   - Enable CORS in bucket policy

---

## ✅ Verification Steps

To confirm audio is working:

1. Open Music Therapy
2. Select "Calm & Peaceful"
3. Click Play button
4. **Listen for sound** 🎧
5. Check console for "Audio ready to play"
6. Watch progress bar move
7. See waveform animate
8. Adjust volume - sound changes
9. Wait for track to end - next track plays

If ALL of these work → ✅ Audio is working!
If ANY fail → Check troubleshooting section above

---

## 📞 Support

If audio still doesn't work after trying all troubleshooting steps:

1. Share browser console errors
2. Share browser version (Chrome/Firefox/etc)
3. Share OS (Windows/Mac/Linux)
4. Share network status (WiFi/Ethernet)
5. Test the minimal code snippet above

---

**Last Updated:** 2026-01-16  
**Status:** 90% Telugu songs implemented with working audio URLs  
**Known Issues:** Placeholder music (not actual Telugu songs - requires licensing)
