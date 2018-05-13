const Album = require('../models/Album');

function search (req, res) {
  // search can be an artist, an album, a track title
  // a year or a genre
  const {term} = req.params;

  if (!term) {
    res.status(422).send('Search term is missing.');
    return;
  }

  Album.find(
    {"$text": {"$search": term}},
    {score: {"$meta": "textScore"}}
  ).sort({score:{"$meta": "textScore"}})
  .then(results => {
    console.log(results);
    res.status(200).json({results});
  }).catch(err => {
    console.error(err);
  });
}

module.exports = {
  search
}
