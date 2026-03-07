# Required Video Asset

Place the following file in this directory:

- `speaking-reel.mp4` — Speaking reel / highlight clip
  - Format: H.264 MP4
  - Resolution: 1920×1080 recommended
  - Duration: 1–3 minutes ideal
  - The video autoplays muted on load; clicking the play button unmutes and replays

## Optimization tip
Run through HandBrake or ffmpeg before deploying:
  ffmpeg -i input.mp4 -vcodec h264 -acodec aac -crf 23 speaking-reel.mp4
