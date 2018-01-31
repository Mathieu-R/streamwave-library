const mongoose = require('mongoose');
const production = process.env.NODE_ENV === 'production';
const DBURL = production ? process.env.DBURLPROD : process.env.DBURLDEV;
mongoose.Promise = global.Promise;

mongoose.connect(DBURL)
  .catch(err => console.error(err));

module.exports = mongoose;

