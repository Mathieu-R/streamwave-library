const mongoose = require('../mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;
const {TrackSchema} = require('./Track');

const AlbumSchema = new mongoose.Schema({
  artist: {
    type: String,
    required: true,
    // indexed by elastic-search
    es_indexed: true
  },
  title: {
    type: String,
    required: true,
    es_indexed: true
  },
  year: {
    type: Number,
    required: true,
    es_indexed: true
  },
  genre: {
    type: String,
    es_indexed: true
  },
  coverURL: {
    type: String,
    required: true
  },
  // embedded documents
  tracks: {
    type: [TrackSchema],
    es_type: 'nested',
    es_include_in_parent: true
  },
  primaryColor: {
    r: {
      type: Number,
      required: true,
      min: 0,
      max: 255
    },
    g: {
      type: Number,
      required: true,
      min: 0,
      max: 255
    },
    b: {
      type: Number,
      required: true,
      min: 0,
      max: 255
    }
  }
});

AlbumSchema.index({created_at: 1});
AlbumSchema.index({
  genre: 'text',
  year: 'text',
  title: 'text',
  artist: 'text',
  'tracks.title': 'text' // index for embedded document
}, {
  weights: {
    title: 10,
    artist: 7,
    genre: 5,
    year: 2
  },
  name: "libraryTextIndex"
});

const Album = mongoose.model('Album', AlbumSchema);
module.exports = Album;
