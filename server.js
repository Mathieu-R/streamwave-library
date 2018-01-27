const http = require('http');
const express = require('express');
const dotenv = require('dotenv').config();
const bodyParser = require('body-parser');
const jwt = require('./middlewares/jwt');
const cors = require('cors');
const url = require('url');

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

router.use(bodyParser.json());
router.use(jwt);

router.get('/health', (req, res) => res.send('library api is up !\n'));

app.use(router);

server.listen(5000, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});
