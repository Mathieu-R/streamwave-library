const {insertAlbums} = require('./seed');

insertAlbums()
  .then(albums => {
    process.exit(1);
  })
  .catch(err => {
    console.error(err);
    process.exit(0);
  });
