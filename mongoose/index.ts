import mongoose from "mongoose";

const production: String = process.env.NODE_ENV === "production";
const DBURL: String = production ? process.env.DBURL_PROD : process.env.DBURL_DEV;

mongoose.Promise = global.Promise;

mongoose.connect(DBURL)
  .catch(err => console.error(err));

export default mongoose;

