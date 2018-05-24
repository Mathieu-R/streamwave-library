const slugify = require('slugify');

const metadataObject = (metadata, filename) => {
  const albumSlug = slugify(metadata.album, {lower: true});
  return {
    artist: metadata.artist[0],
    album: metadata.album,
    title: metadata.title,
    year: metadata.year,
    trackNumber: metadata.track.no,
    genre: metadata.genre[0],
    duration: metadata.duration,
    coverURL: `${albumSlug}/${albumSlug}.jpg`,
    manifestURL: `${albumSlug}/${filename}/manifest-full.mpd`,
    playlistHLSURL: `${albumSlug}/${filename}/playlist-all.m3u8`,
    audio128URL: `${albumSlug}/${filename}/${filename}-128.mp4`,
    audio192URL: `${albumSlug}/${filename}/${filename}-192.mp4`,
    audio256URL: `${albumSlug}/${filename}/${filename}-256.mp4`
  }
}

module.exports = {
  metadataObject
}
