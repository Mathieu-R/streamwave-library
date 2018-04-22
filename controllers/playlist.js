const Playlist = require('../models/Playlist');
const Track = require('../models/Track');
const ws = require('../websocket');

function getUserAllPlaylists (req, res) {
  Playlist.find({userId: req.user.id})
    .then(playlists => res.status(200).json(playlists))
    .catch(err => console.error(err));
}

function getUserPlaylist (req, res) {
  const {id} = req.params;

  if (!id) {
    res.status(422).send('playlist id is missing');
    return;
  }

  // use projection here to only retrieve tracks list
  Playlist.findOne({_id: id}, {tracks: 1})
    .then(tracksId => {
      // maybe do not need $in
      // https://docs.mongodb.com/manual/core/index-multikey/
      return Track.find({"$in": {tracksId}});
    })
    .then(tracks => {
      return res.status(200).json(tracks);
    })
    .catch(err => console.error(err));
}

function addPlaylist (req, res) {
  const {title} = req.body;
  console.log(req.body.title);

  if (!title) {
    res.status(422).send('playlist title is missing.');
    return;
  }

  const playlist = new Playlist({
    userId: req.user.id,
    title,
    tracks: []
  });

  playlist.save()
    .then(playlist => res.status(200).send(playlist))
    // broadcast to all other user devices connected through websocket
    .then(_ => {

    })
    .catch(err => console.error(err));
}

function addTrackToPlaylist (req, res) {
  const {playlistId} = req.params;
  const {trackId} = req.body;

  if (!playlistId) {
    res.status(422).send('playlist id is missing');
    return;
  }

  if (!trackId) {
    res.status(422).send('track id is missing');
    return;
  }

  Playlist.findById(playlistId)
    .then(playlist => {
      playlist.tracks.push(trackId);
      return playlist;
    })
    .then(playlist => playlist.save())
    .then(() => res.status(200).json({done: true}))
    .catch(err => console.error(err));
}

module.exports = {
  getUserAllPlaylists,
  getUserPlaylist,
  addPlaylist,
  addTrackToPlaylist
}
