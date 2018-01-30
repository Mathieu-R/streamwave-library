const Playlist = require('../models/Playlist');
const Track = require('../models/Track');

function getAllUserPlaylists (req, res) {

}

function getUserPlaylist (req, res) {

}

function addPlaylist (req, res) {

}

function addTrackToPlaylist (req, res) {
  const {id} = req.params;

  if (!id) {
    res.status(422).send('track missing');
  }
}

module.exports = {
  getAllUserPlaylists,
  getUserPlaylist,
  addPlaylist,
  addTrackToPlaylist
}
