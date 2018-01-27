const http = require('http');
const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const postgres = require('./pgsql');
const cors = require('cors');
const url = require('url');

const jwt = require('./middlewares/jwt');
const {
  getLibrary, getAlbum
} = require('./controllers/library');
const {
  getAllUserPlaylists, getUserPlaylist
} = require('./controllers/playlist');

const app = express();
const server = http.createServer(app);
const router = express.Router();

const PORT = 5000;
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) {
      cb(null, false);
      return;
    }
    const u = url.parse(origin);
    cb(null, u.hostname == 'localhost' || u.hostname == '127.0.0.1');
  },
  allowedHeaders: ['Content-Type']
};

// create table if does not exist
// {force: true} to force table re-creation
postgres.sync();

router.use(bodyParser.json());
router.use(jwt);

router.get('/health', (req, res) => res.send('library api is up !\n'));
router.get('/library', getLibrary);
router.get('/album/:title', getAlbum);
router.get('/playlists', getAllUserPlaylists);
router.get('/playlist/:title', getUserPlaylist);

app.use(router);

server.listen(5000, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});
