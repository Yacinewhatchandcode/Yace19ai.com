#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# ffmpeg Video Compilation Scripts
# Multi-Agent Orchestration — January 2026
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

FRAMES_DIR="${FRAMES_DIR:-./frames}"
OUTPUT_DIR="${OUTPUT_DIR:-./output}"
AUDIO_FILE="${AUDIO_FILE:-}"

mkdir -p "$OUTPUT_DIR"

# ═══════════════════════════════════════════════════════════════════════════════
# Compile frames to MP4 (with optional audio)
# ═══════════════════════════════════════════════════════════════════════════════
compile_mp4() {
    local output="${1:-$OUTPUT_DIR/demo.mp4}"
    
    echo "🎬 Compiling frames to MP4..."
    
    if [ -n "$AUDIO_FILE" ] && [ -f "$AUDIO_FILE" ]; then
        ffmpeg -framerate 1 -pattern_type glob -i "${FRAMES_DIR}/*.png" \
            -i "$AUDIO_FILE" \
            -c:v libx264 -r 25 -pix_fmt yuv420p \
            -c:a aac -shortest \
            -y "$output"
    else
        ffmpeg -framerate 1 -pattern_type glob -i "${FRAMES_DIR}/*.png" \
            -c:v libx264 -r 25 -pix_fmt yuv420p \
            -y "$output"
    fi
    
    echo "✅ Output: $output"
}

# ═══════════════════════════════════════════════════════════════════════════════
# Compile frames to WebM (for web)
# ═══════════════════════════════════════════════════════════════════════════════
compile_webm() {
    local output="${1:-$OUTPUT_DIR/demo.webm}"
    
    echo "🎬 Compiling frames to WebM..."
    
    ffmpeg -framerate 1 -pattern_type glob -i "${FRAMES_DIR}/*.png" \
        -c:v libvpx-vp9 -b:v 2M \
        -y "$output"
    
    echo "✅ Output: $output"
}

# ═══════════════════════════════════════════════════════════════════════════════
# Compile to HLS for streaming
# ═══════════════════════════════════════════════════════════════════════════════
compile_hls() {
    local output_dir="${1:-$OUTPUT_DIR/hls}"
    
    echo "🎬 Compiling to HLS..."
    mkdir -p "$output_dir"
    
    ffmpeg -framerate 1 -pattern_type glob -i "${FRAMES_DIR}/*.png" \
        -c:v libx264 -preset fast \
        -hls_time 4 -hls_playlist_type vod \
        -y "$output_dir/playlist.m3u8"
    
    echo "✅ Output: $output_dir/playlist.m3u8"
}

# ═══════════════════════════════════════════════════════════════════════════════
# Generate 30-second demo clip
# ═══════════════════════════════════════════════════════════════════════════════
generate_demo() {
    local output="${1:-$OUTPUT_DIR/demo_30s.mp4}"
    
    echo "🎬 Generating 30-second demo clip..."
    
    ffmpeg -framerate 1 -pattern_type glob -i "${FRAMES_DIR}/*.png" \
        -c:v libx264 -r 25 -pix_fmt yuv420p \
        -t 30 \
        -y "$output"
    
    echo "✅ Output: $output"
}

# ═══════════════════════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════════════════════
case "${1:-help}" in
    mp4)    compile_mp4 "${2:-}" ;;
    webm)   compile_webm "${2:-}" ;;
    hls)    compile_hls "${2:-}" ;;
    demo)   generate_demo "${2:-}" ;;
    *)
        echo "Usage: $0 <command> [output]"
        echo "Commands: mp4, webm, hls, demo"
        ;;
esac
