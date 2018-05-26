const {promisify} = require('util');
const fs = require('fs');
const dotenv = require('dotenv').config();
const {medianCut} = require('./lib/median-cut');
const CDN = 'https://cdn.streamwave.be';

const Album = require('./models/Album');
const {Track} = require('./models/Track');

function insertAlbums (data, owner = 'all') {
  const albumsObject = prepareAlbumsObject(data, owner);
  const albumsWithPrimaryColorPromise = Promise.all(albumsObject.map(album => {
    return fetchCoverAndPerformMedianCut(`${CDN}/${album.coverURL}`).then(primaryColor => {
      album.primaryColor = primaryColor;
      return album;
    });
  }));

  return albumsWithPrimaryColorPromise.then(albums => {
    return Album.insertMany(albums);
  });
}

function insertAlbumsByUser (data, owner, coverPath) {
  const albumsObject = prepareAlbumsObject(data, owner);
  const albumsWithPrimaryColorPromise = Promise.all(albumsObject.map(album => {
    return fetchCoverAndPerformMedianCut(coverPath).then(primaryColor => {
      console.log('Primary Color: ', primaryColor);
      // cover generated by music-metadata
      // are unreadable by get pixels (but ok with image viewer)
      // error: SOI not found
      if (!primaryColor) {
        album.primaryColor = {r: 0, g: 0, b: 0}
      } else {
        album.primaryColor = primaryColor;
      }
      return album;
    });
  }));

  return albumsWithPrimaryColorPromise.then(albums => {
    return Album.insertMany(albums);
  });
}

function prepareAlbumsObject (seed, owner) {
  return seed.reduce((prev, track) => {
    const index = prev.findIndex(obj => obj.title === track.album);
    if (index >= 0) {
      prev[index]['tracks'].push(trackObject(track));
    } else {
      prev.push(albumObject(track, trackObject(track), owner));
    }
    return prev;
  }, []);
}

function trackObject ({trackNumber, title, coverURL, duration, manifestURL, playlistHLSURL, audio128URL, audio192URL, audio256URL}) {
  return {
    number: trackNumber,
    title,
    coverURL,
    playlists: [],
    duration,
    manifestURL,
    playlistHLSURL,
    audio128URL,
    audio192URL,
    audio256URL
  };
}

function albumObject ({artist, album, year, genre, coverURL}, track, owner) {
    return {
      owner,
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
  return medianCut(coverURL);
}

module.exports = {
  insertAlbums,
  insertAlbumsByUser
}
