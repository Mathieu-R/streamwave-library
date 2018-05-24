const { promisify } = require('util');
const { exec } = require('child_process');
const path = require('path');
const mm = promisify(require('musicmetadata'));
const { metadataObject } = require('../utils');
const { insertAlbums } = require('../seed');

const Album = require('../models/Album');
const { Track } = require('../models/Track');

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
  const {musics} = req.files;

  try {
    const {metadatas, album} = await retrieveMetadata(musics);
    await processFiles({path: '/tmp/uploads', album});
    await insertIntoDatabase(metadatas, req.user.id);
    await uploadToCDN(album);
    res.status(200).json({done: true});
  } catch (err) {
    console.error(err);
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
  const metadatas = await Promise.all(musics.map(music => {
    const stream = fs.createReadStream(music.path);
    const metadata = mm(stream, {duration: true});
    stream.close();
    return metadata;
  }));

  const object = metadatas.map(async metadata => {
    // in case of single
    metadata.album = metadata.album || metadata.title;
    await promisify(fs.writeFile)(`/tmp/uploads/src/artworks/${slugify(metadata.album)}.jpg`, metadata.picture[0].data);
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
    return promisify(exec)(`mv /tmp/uploads/dest/ /var/www/assets/CDN/${album}/`);
  }

  console.error('upload only works in production mode...');
}

module.exports = {
  getLibrary,
  getAlbum,
  uploadMusic
}
