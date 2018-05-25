const { promisify } = require('util');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const musicmetadata = require('musicmetadata');
const { metadataObject } = require('../utils');
const { insertAlbums } = require('../seed');

const Album = require('../models/Album');
const { Track } = require('../models/Track');

const mm = promisify(musicmetadata);
const move = promisify(fs.rename);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

function getLibrary (req, res) {
  Album.find({owner: 'all' || req.user.id})
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

async function uploadMusic (req, res) {
  const musics = req.files;
  try {
    const {metadatas, album} = await retrieveMetadata(musics);
    console.log(metadatas, album);
    return;
    await processFiles({path: '/tmp/uploads', album});
    await insertIntoDatabase(metadatas, req.user.id);
    await uploadToCDN(album);
    await clearTempDirectory();
    res.status(200).json({done: true});
  } catch (err) {
    await clearTempDirectory();
    console.error(err);
    res.status(500).send('Erreur lors de l\'importation des musiques');
  }
}

// generates dash manifest
// and different media qualities
// do not think hls manifest is possible here
// cause it only works with mac
// dest files => /tmp/uploads/dest
const processFiles = async ({path, album}) => {
  const shellScriptPath = path.resolve(__dirname, '../lib/encoder-auto.sh');
  const {stdout, stderr} = await promisify(exec)(`${shellScriptPath} ${path} ${album}`);
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}

// retrieve metadata
// from files
const retrieveMetadata = async (musics) => {
  let album;
  const metadatasPromises = Promise.all(musics.map(music => {
    const stream = fs.createReadStream(music.path);
    const metadata = mm(stream, {duration: true});
    stream.close();
    return metadata;
  }));

  console.log(metadatasPromises);
  const metadatas = await metadatasPromises;
  console.log(metadatas);
  return;
  const object = metadatas.map(async metadata => {
    // in case of single
    metadata.album = metadata.album || metadata.title;
    await promisify(fs.writeFile)(`/tmp/uploads/dest/${slugify(metadata.album)}.jpg`, metadata.picture[0].data);
    // create metadata. remove the extension
    return metadataObject(metadata, metadata.name.replace(/\..*$/, ''));
  });

  return {metadatas: object, album: object[0].metadata};
}

// insert metadata into database
// TODO: change album collections
// field: owner => 'all', '<userid>'
const insertIntoDatabase = (metadatas, userid) => {
  return insertAlbums(metadatas, userid);
}

// upload files to cdn
const uploadToCDN = () => {
  if (process.env.NODE_ENV === 'production') {
    return move('/tmp/uploads/dest/', `/var/www/assets/CDN/${album}/`);
  }

  console.error('upload only works in production mode...');
}

const clearTempDirectory = async () => {
  const directory = '/tmp/uploads';
  const files = await readdir(directory);
  const unlinkPromises = files.map(filename => unlink(`${directory}/${filename}`));
  return Promise.all(unlinkPromises);
}

module.exports = {
  getLibrary,
  getAlbum,
  uploadMusic
}
