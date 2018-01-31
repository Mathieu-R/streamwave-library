const Sequelize = require('sequelize');
const db = require('../pgsql');

const Album = db.define('album', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false
  },
  artist: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  title: {
    type: Sequelize.STRING(50),
    allowNull: false
  },
  year: {
    type: Sequelize.SMALLINT,
    allowNull: false
  },
  genre: {
    type: Sequelize.STRING,
    allowNull: true
  },
  coverURL: {
    type: Sequelize.STRING,
    allowNull: false
  },
  primaryColorR: {
    type: Sequelize.TINYINT,
    allowNull: false,
    validate: {
      min: 0,
      max: 255
    }
  },
  primaryColorG: {
    type: Sequelize.TINYINT,
    allowNull: false,
    validate: {
      min: 0,
      max: 255
    }
  },
  primaryColorB: {
    type: Sequelize.TINYINT,
    allowNull: false,
    validate: {
      min: 0,
      max: 255
    }
  }
});

module.exports = Album;

