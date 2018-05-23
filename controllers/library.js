const {util} = require('promisify');
const {exec} = require('child_process');
const path = require('path');

const Album = require('../models/Album');
const {Track} = require('../models/Track');

function getLibrary (req, res) {
  Album.find({})
    .limit(10)
    .sort({created_at: -1})
    .then(albums => res.json(albums))
    .catch(err => console.error(err));
}

function getAlbum (req, res) {
  const {id} = req.params;

  if (!id) {
    res.status(422).send('album id missing !');
    return;
  }

  Album.findById(id)
    .then(tracks => res.json(tracks))
    .catch(err => console.error(err));
}

function uploadMusic (req, res) {

}

// generates dash manifest
// and different media qualities
// do not think hls manifest is possible here
// cause it only works with mac
const processFiles = async () => {
  const shellScriptPath = path.resolve(__dirname, '../lib/encode.sh');
  const {stdout, stderr} = await promisify(exec)(shellScriptPath);
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}

// retrieve metadata
// from processed files
const retrieveMetadata = async () => {

}

// insert metadata into database
// TODO: change album collections
// field: owner => 'all', '<userid>'
const insertIntoDatabase = async () => {

}

// upload files to cdn
// surely the hard part
// cause cdn is hosted on vps
const uploadToCDN = async () => {

}

module.exports = {
  getLibrary,
  getAlbum
}
