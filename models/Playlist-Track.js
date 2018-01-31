const Sequelize = require('sequelize');
const db = require('../pgsql');

// playlistId and trackId seem to be auto-defined.
// In fact, I only need that model if I want to add an attribute to it
// http://docs.sequelizejs.com/class/lib/associations/belongs-to-many.js~BelongsToMany.html
const PlaylistTrack = db.define('playlist-track');

module.exports = PlaylistTrack;
