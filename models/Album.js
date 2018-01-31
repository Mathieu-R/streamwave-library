const mongoose = require('../mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;
const Track = require('./Track');

const AlbumSchema = new mongoose.Schema({
  artist: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  genre: {
    type: String
  },
  coverURL: {
    type: String,
    required: true
  },
  // embedded documents
  tracks: [Track],
  primaryColorR: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  },
  primaryColorG: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  },
  primaryColorB: {
    type: Number,
    required: true,
    min: 0,
    max: 255
  }
})

const Album = mongoose.model('Album', AlbumSchema);
module.exports = Album;
