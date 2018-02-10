const Album = require('../models/Album');
const Track = require('../models/Track');

function getLibrary (req, res) {
  Album.find({})
    .limit(10)
    .sort({created_at: -1})
    .then(albums => res.json(albums))
    .catch(err => console.error(err));
}

function getAlbum (req, res) {
  // maybe do not need that
  const {id} = req.params;

  if (!id) {
    res.status(422).send('album id missing !');
    return;
  }

  Track.findOne()
}

module.exports = {
  getLibrary,
  getAlbum
}
