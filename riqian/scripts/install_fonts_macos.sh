#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="${0:A:h}"
FONT_DIR="${SCRIPT_DIR:h}/assets/fonts"
TARGET_DIR="${HOME}/Library/Fonts"

mkdir -p "$TARGET_DIR"

for font in 'Bell MT Bold.ttf' '仿宋.ttf' '微软雅黑 Light.ttc'; do
  source_file="$FONT_DIR/$font"
  target_file="$TARGET_DIR/$font"

  if [[ ! -f "$source_file" ]]; then
    print -u2 "Missing bundled font: $source_file"
    exit 1
  fi

  if [[ -e "$target_file" ]]; then
    print "Already present, left unchanged: $target_file"
  else
    install -m 644 "$source_file" "$target_file"
    print "Installed: $target_file"
  fi
done

print 'Restart PowerPoint before opening the 日签文件.'
