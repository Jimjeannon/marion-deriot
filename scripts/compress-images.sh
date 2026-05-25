#!/bin/bash

# Script de compression d'images — Marion Dériot
# Utilise ffmpeg/imagemagick pour réduire les JPG massifs
# Cible : réduction 80-90% via recompression + redimensionnement

set -e

IMAGE_DIR="$(dirname "$0")/../public/images"
QUALITY=75
MAX_WIDTH=2560

TOTAL_BEFORE=0
TOTAL_AFTER=0
FILES_PROCESSED=0

echo "🖼️  Compression d'images — Marion Dériot"
echo "📂 Répertoire : $IMAGE_DIR"
echo ""

if [ ! -d "$IMAGE_DIR" ]; then
  echo "❌ Le répertoire n'existe pas : $IMAGE_DIR"
  exit 1
fi

# Fonction formatage bytes
format_bytes() {
  local bytes=$1
  if [ $bytes -lt 1024 ]; then
    echo "${bytes} B"
  elif [ $bytes -lt 1048576 ]; then
    echo "$((bytes / 1024)) KB"
  else
    echo "$(echo "scale=1; $bytes / 1048576" | bc) MB"
  fi
}

# Fonction traitement une image
process_image() {
  local file="$1"
  local ext="${file##*.}"

  # Skip si pas JPG
  if [[ ! "$ext" =~ ^(jpg|jpeg|JPG|JPEG)$ ]]; then
    return 0
  fi

  local before=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)

  if [ $before -eq 0 ]; then
    echo "⚠️  Impossible de lire : $(basename "$file")"
    return 0
  fi

  # Créer backup temporaire
  local tmp_file="${file}.tmp"
  cp "$file" "$tmp_file"

  # Compresser avec ffmpeg (plus fiable)
  if command -v ffmpeg &> /dev/null; then
    ffmpeg -i "$tmp_file" -q:v $QUALITY -y "$file" 2>/dev/null || {
      mv "$tmp_file" "$file"
      echo "⚠️  Erreur ffmpeg : $(basename "$file")"
      return 0
    }
  elif command -v convert &> /dev/null; then
    # Fallback ImageMagick
    convert "$tmp_file" -quality $QUALITY "$file" 2>/dev/null || {
      mv "$tmp_file" "$file"
      echo "⚠️  Erreur convert : $(basename "$file")"
      return 0
    }
  else
    echo "❌ Ni ffmpeg ni ImageMagick trouvés. Installez un outil de compression."
    exit 1
  fi

  rm -f "$tmp_file"

  local after=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
  local saved=$((before - after))
  local pct=$((saved * 100 / before))

  TOTAL_BEFORE=$((TOTAL_BEFORE + before))
  TOTAL_AFTER=$((TOTAL_AFTER + after))
  FILES_PROCESSED=$((FILES_PROCESSED + 1))

  local before_fmt=$(format_bytes $before)
  local after_fmt=$(format_bytes $after)

  echo "✓ $(basename "$file") | $before_fmt → $after_fmt (−${pct}%)"
}

# Parcourir tous les fichiers
find "$IMAGE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) | while read -r file; do
  process_image "$file"
done

echo ""
echo "═══════════════════════════════════════════════"
echo "📊 RÉSUMÉ"
echo "═══════════════════════════════════════════════"
echo "Fichiers traités    : $FILES_PROCESSED"
echo ""
echo "Total avant         : $(format_bytes $TOTAL_BEFORE)"
echo "Total après         : $(format_bytes $TOTAL_AFTER)"

if [ $TOTAL_BEFORE -gt 0 ]; then
  TOTAL_SAVED=$((TOTAL_BEFORE - TOTAL_AFTER))
  TOTAL_PCT=$((TOTAL_SAVED * 100 / TOTAL_BEFORE))
  echo "Réduction totale    : $(format_bytes $TOTAL_SAVED) (−${TOTAL_PCT}%)"
fi

echo ""
echo "✅ Compression terminée !"
