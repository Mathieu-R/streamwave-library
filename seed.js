const {promisify} = require('util');
const fs = require('fs');
const dotenv = require('dotenv').config();
const {medianCut} = require('./lib/median-cut');
const CDN = 'https://cdn.streamwave.be';

const seed = JSON.parse(fs.readFileSync('./seed.json'));
const Album = require('./models/Album');
const Track = require('./models/Track');

function insertAlbums () {
  const albumsObject = prepareAlbumsObject(seed);
  const albumsWithPrimaryColorPromise = Promise.all(albumsObject.map(album => {
    return fetchCoverAndPerformMedianCut(album.coverURL).then(primaryColor => {
      album.primaryColor = primaryColor;
      return album;
    });
  }));

  return albumsWithPrimaryColorPromise.then(albums => {
    return Album.insertMany(albums);
  });
}

function prepareAlbumsObject (seed) {
  return seed.reduce((prev, track) => {
    const index = prev.findIndex(obj => obj.title === track.album);
    if (index >= 0) {
      prev[index]['tracks'].push(trackObject(track));
    } else {
      prev.push(albumObject(track));
    }
    return prev;
  }, []);
}

function trackObject ({trackNumber, title, duration, manifestURL, playlistHLSURL, audio128URL, audio192URL, audio256URL}) {
  return {
    number: trackNumber,
    title,
    playlists: [],
    duration,
    manifestURL,
    playlistHLSURL,
    audio128URL,
    audio192URL,
    audio256URL
  };
}

function albumObject ({artist, album, year, genre, coverURL}, track) {
    return {
      artist,
      title: album,
      year: year || 0,
      genre: genre || 'unknown',
      coverURL,
      tracks: [track],
      primaryColor: {r: 0, g: 0, b: 0}
    };
}

function fetchCoverAndPerformMedianCut (coverURL) {
  return medianCut(`${CDN}/${coverURL}`);
}

module.exports = {
  insertAlbums
}
