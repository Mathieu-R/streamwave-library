const Album = require('../models/Album');
const Playlist = require('../models/Playlist');

function search (req, res) {
  // search can be an artist, an album, a track title
  // a year, a genre or a playlist
  const {term} = req.params;

  if (!term) {
    res.status(422).send('Search term is missing.');
    return;
  }
}

module.exports = {
  search
}
