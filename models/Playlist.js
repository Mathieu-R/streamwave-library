const Sequelize = require('sequelize');
const db = require('../pgsql');

const Track = require('./Track');
const PlaylistTrack = require('./Playlist-Track');

const Playlist = db.define('playlist', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false
  },
  userId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

Playlist.belongsToMany(Track, {through: PlaylistTrack});
module.exports = Playlist;
