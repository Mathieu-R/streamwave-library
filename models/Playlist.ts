import { Schema } from "mongoose";
import mongoose from "../mongoose";
import { TrackSchema } from "./Track";

const ObjectID = mongoose.Schema.Types.ObjectId;

const PlaylistSchema: Schema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  // embedded document
  tracks: {
    type: [TrackSchema],
  },
});

PlaylistSchema.index({ userId: 1 });

const Playlist = mongoose.model("Playlist", PlaylistSchema);

export default Playlist;
