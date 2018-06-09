const {promisify} = require('util');
const redis = require('redis');
const client = redis.createClient();

const get = promisify(client.set).bind(client);
const set = promisify(client.set).bind(client);
const del = promisify(client.del).bind(client);

client.on('error', err => console.error(err));
client.on('reconnecting', console.log('datastore reconnecting...'));
client.on('end', console.log('datastore killed.'));

module.exports = {
  get,
  set,
  del
}
