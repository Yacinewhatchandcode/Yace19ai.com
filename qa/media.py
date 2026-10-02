"""Measure all repository video/audio files; generate small inspectable contact sheets."""
import concurrent.futures
import json
import re
import subprocess
from pathlib import Path

out = Path("qa-evidence")
(out / "contact-sheets").mkdir(parents=True, exist_ok=True)
media = sorted(p for p in Path("public").rglob("*") if p.suffix in {".mp4", ".webm", ".mp3", ".wav", ".ogg"})
if Path("demo.mp4").exists() and not Path("public/demo.mp4").exists():
    media.append(Path("demo.mp4"))

def run(args):
    result = subprocess.run(args, text=True, capture_output=True, check=True)
    return result.stdout + result.stderr

def measure(path):
    info = json.loads(run(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)]))
    (out / "contact-sheets" / (path.stem + "-ffprobe.json")).write_text(json.dumps(info, indent=2) + "\n")
    duration = float(info["format"]["duration"])
    video = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    audio = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    volume_result = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "volumedetect",
                                    "-vn", "-f", "null", "-"], text=True, capture_output=True)
    volume = volume_result.stdout + volume_result.stderr
    (out / "contact-sheets" / (path.stem + "-volume.txt")).write_text(volume)
    audio_state = "no audio stream"
    if audio:
        volume_result.check_returncode()
        mean = re.search(r"mean_volume: ([\w.-]+) dB", volume)
        audio_state = "silent" if mean and (mean[1] == "-inf" or float(mean[1]) < -60) else "audible"
    ratio, sheet, samples = None, None, 0
    if video:
        stats = run(["ffmpeg", "-hide_banner", "-i", str(path), "-vf",
                     "fps=2,scale=320:-1,signalstats,metadata=print:key=lavfi.signalstats.YMAX:file=-",
                     "-an", "-f", "null", "-"])
        (out / "contact-sheets" / (path.stem + "-signalstats.txt")).write_text(stats)
        maxima = [int(n) for n in re.findall(r"lavfi.signalstats.YMAX=(\d+)", stats)]
        samples = len(maxima)
        ratio = sum(n < 120 for n in maxima) / samples if samples else None
        native_ratio = None
        if not samples:
            native = run(["ffmpeg", "-hide_banner", "-i", str(path), "-vf",
                          "scale=320:-1,signalstats,metadata=print:key=lavfi.signalstats.YMAX:file=-",
                          "-an", "-f", "null", "-"])
            (out / "contact-sheets" / (path.stem + "-native-signalstats.txt")).write_text(native)
            values = [int(n) for n in re.findall(r"lavfi.signalstats.YMAX=(\d+)", native)]
            native_ratio = sum(n < 120 for n in values) / len(values) if values else None
        sheet = str(out / "contact-sheets" / (path.stem + ".jpg"))
        run(["ffmpeg", "-y", "-hide_banner", "-i", str(path), "-vf",
             f"fps={6 / duration},scale=320:-1,tpad=stop_mode=clone:stop_duration=1,tile=3x2",
             "-frames:v", "1", "-q:v", "4", sheet])
        posters = Path("public/media-posters")
        posters.mkdir(exist_ok=True)
        run(["ffmpeg", "-y", "-hide_banner", "-ss", str(duration / 2), "-i", str(path), "-vf", "scale=640:-1",
             "-frames:v", "1", "-q:v", "4", str(posters / (path.stem + ".jpg"))])
    warnings = []
    if video and ratio is not None and ratio > 0.2:
        warnings.append("More than 20% sampled frames have YMAX<120; inspect dark/blank content.")
    if audio_state != "audible":
        warnings.append("Silent recording; no spoken narration or audible demonstration.")
    if video and not samples:
        warnings.append("Single-frame 0.04s file: 2fps produces no samples. Not a meaningful motion demo; original source required.")
    url = "/" + str(path.relative_to("public")) if str(path).startswith("public/") else "/" + str(path)
    return {"path": str(path), "url": url, "duration": round(duration, 3),
            "video_codec": video["codec_name"] if video else None,
            "width": video.get("width") if video else None, "height": video.get("height") if video else None,
            "audio_state": audio_state, "blank_ratio": ratio, "blank_samples": samples,
            "native_frame_blank_ratio": native_ratio if video and not samples else None,
            "blank_threshold": "YMAX<120 at 2fps", "screenshots": [sheet] if sheet else [],
            "warnings": warnings, "qa_status": "needs_visual_review" if video else "measured",
            "caption": "Archived recording; not proof of a currently live service."}

def inspect(path):
    try:
        return measure(path)
    except (subprocess.CalledProcessError, ValueError, KeyError, RuntimeError) as error:
        error_log = str(error)
        if isinstance(error, subprocess.CalledProcessError):
            error_log += "\n" + (error.stderr or "")
        (out / "contact-sheets" / (path.stem + "-error.txt")).write_text(error_log)
        return {"path": str(path), "url": "/" + str(path.relative_to("public")),
                "duration": None, "audio_state": "unreadable", "blank_ratio": None,
                "screenshots": [], "qa_status": "failed",
                "warnings": ["Media cannot be decoded; original source required."],
                "error": error_log, "width": None, "height": None,
                "caption": "Unavailable recording; not playable."}

with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    results = list(pool.map(inspect, media))
visual_notes = {
    "demo": "Animated portfolio title card, not an EU AI Act compliance demo. No narration.",
    "video-AIA-Creative-Lab": "GitHub repository listing and README capture; no functional product demonstration. No narration.",
    "video-AgentCoderYBE": "GitHub repository listing and README capture; no functional product demonstration. No narration.",
    "video-BSQ": "GitHub repository listing and README capture; no functional product demonstration. No narration.",
    "video-Faith": "GitHub repository listing and README capture; no functional product demonstration. No narration.",
    "video-Prime.AI": "Recording shows GitHub 404/sign-in, not the orchestrator. No narration.",
    "video-SQ_BAHA": "GitHub repository listing and README capture; no functional product demonstration. No narration.",
    "video-Sovereign-Ecosystem": "GitHub repository listing capture; no functional product demonstration. No narration.",
    "video-Yace19ai.com": "GitHub repository listing capture; not the current site. No narration.",
    "aia-creative-lab": "Creative avatar and science-fiction promotional montage; visible HeyGen watermark. Illustrative, not factual footage.",
    "converse-promo": "Single-frame 'Generating recording...' placeholder, not a completed video.",
    "faith-demo": "Illustrative promotional animation with globe, humanoid and robot; not functional product evidence.",
    "sovereign-factory": "Single-frame 'Generating recording...' placeholder, not a completed video.",
    "whatsapp-demo": "Historical French mobile website/Calendly walkthrough. Marketing claims inside the footage are unverified. No narration.",
}
for item in results:
    name = Path(item["path"]).stem
    if name in visual_notes:
        item["visual_review"] = visual_notes[name]
        item["caption"] = visual_notes[name]
        item["qa_status"] = "failed_content" if name in {"video-Prime.AI", "converse-promo", "sovereign-factory"} else "pass_with_context"
        item["visual_reviewed"] = True
(out / "media.json").write_text(json.dumps(results, indent=2) + "\n")
Path("public/media-catalog.json").write_text(json.dumps(results, indent=2) + "\n")
print(f"Measured {len(results)} media files")
