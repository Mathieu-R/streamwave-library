const mongoose = require('../mongoose');
const ObjectID = mongoose.Schema.Types.ObjectId;

const PlaylistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  // references to track id
  tracks: [ObjectID]
});

PlaylistSchema.index({userId: 1});

const Playlist = mongoose.model('Playlist', PlaylistSchema);
module.exports = Playlist;
