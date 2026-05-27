"""
Video Downloader for IntelliHeal Exercise Videos
Downloads 30 workout videos (5-6 per category) and saves them locally
"""

import os
import subprocess
import json

# Create videos directory
os.makedirs('public/videos/cardio', exist_ok=True)
os.makedirs('public/videos/strength', exist_ok=True)
os.makedirs('public/videos/yoga', exist_ok=True)
os.makedirs('public/videos/stretching', exist_ok=True)

# Video database - 30 videos total
videos = {
    "cardio": [
        {"id": "gC_L9qAHVJ8", "name": "beginner_cardio_20min"},
        {"id": "ml6cT4AZdqI", "name": "hiit_cardio_30min"},
        {"id": "5if4cjO5nxo", "name": "dance_workout_15min"},
        {"id": "cbfUHrVGUhA", "name": "cardio_blast_25min"},
        {"id": "Vd9PjYv48X8", "name": "fat_burn_10min"},
        {"id": "kZDvg92tTMc", "name": "walking_workout_20min"},
    ],
    "strength": [
        {"id": "1919eTCoESo", "name": "ab_workout_10min"},
        {"id": "IODxDxX7oi4", "name": "upper_body_15min"},
        {"id": "UBMk30rjy0o", "name": "full_body_20min"},
        {"id": "B296mZDhrP4", "name": "leg_workout_30min"},
        {"id": "3p8EBPVZ2Iw", "name": "pilates_core_12min"},
        {"id": "cPXhJJvGThE", "name": "arms_workout_15min"},
    ],
    "yoga": [
        {"id": "v7AYKMP6bjM", "name": "yoga_beginners_20min"},
        {"id": "4pKly2JojMw", "name": "morning_yoga_15min"},
        {"id": "BiWDsfZ3zbo", "name": "bedtime_yoga_25min"},
        {"id": "s2h4Jq1fC2Y", "name": "stress_relief_yoga_20min"},
        {"id": "Yzm3fA2HhkQ", "name": "power_yoga_30min"},
        {"id": "DWmGArQBtFI", "name": "back_pain_yoga_20min"},
    ],
    "stretching": [
        {"id": "L_xrDAtykMI", "name": "morning_stretch_10min"},
        {"id": "g_tea8ZNk5A", "name": "full_body_stretch_15min"},
        {"id": "NInGto_jU8A", "name": "hip_flexibility_12min"},
        {"id": "qULTwquOuT4", "name": "deep_stretch_20min"},
        {"id": "2rWUFPDz36U", "name": "bedtime_stretch_15min"},
        {"id": "En7icXkrlto", "name": "flexibility_stretch_15min"},
    ]
}

def download_video(video_id, category, filename):
    """Download a single video using yt-dlp"""
    url = f"https://www.youtube.com/watch?v={video_id}"
    output_path = f"public/videos/{category}/{filename}.mp4"
    
    # Skip if already downloaded
    if os.path.exists(output_path):
        print(f"✓ Already exists: {filename}")
        return True
    
    print(f"⬇ Downloading: {filename}...")
    
    # yt-dlp command with quality settings
    cmd = [
        "yt-dlp",
        "-f", "best[height<=720]",  # Max 720p to save space
        "-o", output_path,
        url
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True)
        print(f"✓ Downloaded: {filename}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed: {filename} - {e}")
        return False
    except FileNotFoundError:
        print("✗ yt-dlp not found. Please install: pip install yt-dlp")
        return False

def main():
    print("=" * 60)
    print("IntelliHeal Video Downloader")
    print("Downloading 30 workout videos...")
    print("=" * 60)
    
    total = 0
    success = 0
    
    for category, video_list in videos.items():
        print(f"\n📁 Category: {category.upper()}")
        print("-" * 60)
        
        for video in video_list:
            total += 1
            if download_video(video["id"], category, video["name"]):
                success += 1
    
    print("\n" + "=" * 60)
    print(f"Download Complete: {success}/{total} videos")
    print("=" * 60)
    
    # Save video metadata
    with open('public/videos/metadata.json', 'w') as f:
        json.dump(videos, f, indent=2)
    print("✓ Metadata saved")

if __name__ == "__main__":
    main()
