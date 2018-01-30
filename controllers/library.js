const Album = require('../models/Album');
const Track = require('../models/Track');

function getLibrary (req, res) {
  Album.getAll().then(albums => res.json(albums));
}

function getAlbum (req, res) {
  const {title} = req.params;

  if (!title) {
    res.status(422).send('album title missing !');
  }
}

module.exports = {
  getLibrary,
  getAlbum
}
