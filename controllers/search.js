const Album = require('../models/Album');

function search (req, res) {
  // search can be an artist, an album, a track title
  // a year or a genre
  const {term} = req.params;

  if (!term) {
    res.status(422).send('Search term is missing.');
    return;
  }

  const conditions = {
    $text: {
      $search: term,
      $caseSensitive: false
    }
  };

  const projection = {score: {"$meta": "textScore"}};

  Album.find(conditions, projection)
  .sort({score:{"$meta": "textScore"}})
  .then(results => {
    const data = {
      albums: [],
      tracks: []
    }
    // not possible to only retrieve subdocuments
    // even if they match
    // ugly code is coming :)
    results.forEach(result => {
      // check if we looked for an album
      if (
        result.artist.toLowerCase().includes(term) ||
        result.title.toLowerCase().includes(term) ||
        result.genre.toLowerCase().includes(term)
      ) {
        data.albums.push(result);
      }

      // otherwise it was a track title
      result.tracks.forEach(track => {
        if (track.title.toLowerCase().includes(term)) {
          data.tracks.push({...track, artist: result.artist, album: result.title});
        }
      });
    });

    res.status(200).json({results: data});
  }).catch(err => {
    console.error(err);
  });
}

module.exports = {
  search
}
