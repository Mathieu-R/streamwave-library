const {insertAlbums} = require('./seed');

insertAlbums()
  .then(() => process.exit(1))
  .catch(() => process.exit(0));
