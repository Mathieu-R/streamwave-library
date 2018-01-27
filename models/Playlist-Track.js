const Sequelize = require('sequelize');
const db = require('../pgsql');

// playlistId and trackId seem to be auto-defined.
// http://docs.sequelizejs.com/class/lib/associations/belongs-to-many.js~BelongsToMany.html
const PlaylistTrack = db.define('playlist-track');

module.exports = PlaylistTrack;
