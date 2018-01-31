const Sequelize = require('sequelize');
const db = require('../pgsql');

const Album = require('./Album');
const Playlist = require('./Playlist');
const PlaylistTrack = require('./Playlist-Track');

const Track = db.define('track', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false
  },
  trackNumber: {
    type: Sequelize.TINYINT,
    allowNull: true
  },
  duration: {
    // duration in second
    type: Sequelize.SMALLINT,
    allowNull: false
  },
  manifestURL: {
    type: Sequelize.STRING,
    allowNull: false
  },
  playlistHLSURL: {
    type: Sequelize.STRING,
    allowNull: false
  },
  audio128URL: {
    type: Sequelize.STRING,
    allowNull: false
  },
  audio192URL: {
    type: Sequelize.STRING,
    allowNull: false
  },
  audio256URL: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

Track.belongsTo(Album);
Track.belongsToMany(Playlist, {through: 'PlaylistTrack'});
module.exports = Track;
