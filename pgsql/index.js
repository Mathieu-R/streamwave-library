const sequelize = require('sequelize');
const {POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB} = process.env;
const db = new sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
  host: POSTGRES_HOST,
  dialect: 'postgres',
  logging: false
});

module.exports = db;
