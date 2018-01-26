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
    type: Sequelize.TINYINT,
    allowNull: false
  },
  coverURL: {
    type: Sequelize.STRING,
    allowNull: false
  },
  primaryColorR: {
    type: Sequelize.TINYINT,
    allowNull: false
  },
  primaryColorG: {
    type: Sequelize.TINYINT,
    allowNull: false
  },
  primaryColorB: {
    type: Sequelize.TINYINT,
    allowNull: false
  }
});

module.exports = Album;

