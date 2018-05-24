#!/bin/zsh
# usage ./encoder.sh

encode () {
  mkdir -p /tmp/uploads/src/$1
  mkdir -p /tmp/uploads/dest/$1

  # encode mp3 file in aac wrapped in mp4 container
  # note: libfdk_aac is an alternative to aac
  # -vn disable video
  # -sn disable subtitle
  ffmpeg -i /tmp/uploads/$1.$3 -c:a aac -b:a 128000 -ar 48000 -ac 2 -vn -sn /tmp/uploads/src/$1/$1-128.mp4
  ffmpeg -i /tmp/uploads/$1.$3 -c:a aac -b:a 192000 -ar 48000 -ac 2 -vn -sn /tmp/uploads/src/$1/$1-192.mp4
  ffmpeg -i /tmp/uploads/$1.$3 -c:a aac -b:a 256000 -ar 48000 -ac 2 -vn -sn /tmp/uploads/src/$1/$1-256.mp4

  # prepare DASH manifest
  ./packager \
    input=/tmp/uploads/src/$1/$1-128.mp4,stream=audio,output=/tmp/uploads/dest/$1/$1-128.mp4 \
    input=/tmp/uploads/src/$1/$1-192.mp4,stream=audio,output=/tmp/uploads/dest/$1/$1-192.mp4 \
    input=/tmp/uploads/src/$1/$1-256.mp4,stream=audio,output=/tmp/uploads/dest/$1/$1-256.mp4 \
  --min_buffer_time 3 \
  --segment_duration 3 \
  --mpd_output /tmp/uploads/dest/$1/manifest-full.mpd

  mkdir -p /tmp/uploads/dest/$1/hls/128
  mkdir -p /tmp/uploads/dest/$1/hls/192
  mkdir -p /tmp/uploads/dest/$1/hls/256

  # prepare m3u8 playlist for HLS
  mediafilesegmenter -t 3 /tmp/uploads/src/$1/$1-128.mp4 -f /tmp/uploads/dest/$1/hls/128
  mediafilesegmenter -t 3 /tmp/uploads/src/$1/$1-192.mp4 -f /tmp/uploads/dest/$1/hls/192
  mediafilesegmenter -t 3 /tmp/uploads/src/$1/$1-256.mp4 -f /tmp/uploads/dest/$1/hls/256

  mv /tmp/uploads/dest/$1/hls/128/prog_index.m3u8 /tmp/uploads/dest/$1/hls/128/$1-128.m3u8
  mv /tmp/uploads/dest/$1/hls/192/prog_index.m3u8 /tmp/uploads/dest/$1/hls/192/$1-192.m3u8
  mv /tmp/uploads/dest/$1/hls/256/prog_index.m3u8 /tmp/uploads/dest/$1/hls/256/$1-256.m3u8

  variantplaylistcreator -o ./dest/$1/playlist-all.m3u8 \
    https://cdn.streamwave.be/$2/$1/hls/128/$1-128.m3u8 /tmp/uploads/src/$1/$1-128.plist \
    https://cdn.streamwave.be/$2/$1/hls/192/$1-192.m3u8 /tmp/uploads/src/$1/$1-192.plist \
    https://cdn.streamwave.be/$2/$1/hls/256/$1-256.m3u8 /tmp/uploads/src/$1/$1-256.plist
}

# each mp3 file in folder
for file in $1/*; do
  filename=$(basename "$file")
  filename="${filename%.*}"
  extension="${filename##*.}"
  album=$2
  #if [ $extension = mp3 ]; then
  encode $filename $album $extension
  #fi
done
