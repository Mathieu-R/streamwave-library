import http from "http";
import express, { Request, Response } from "express";
const dotenv = require("dotenv").config();
import bodyParser from "body-parser";
import multer from "multer";
import crypto from "crypto";
import mime from "mime";
import cors from "cors";
import url from "url";

import { UPLOAD_PATH } from "./utils";

const storage = multer.diskStorage({
  destination: (req: multer.Request, file: multer.File, cb: Function) => {
    cb(null, UPLOAD_PATH);
  },
  // multer does not put extension in filename by default
  // could involve some problems
  // https://github.com/expressjs/multer/issues/170
  filename: (req: multer.Request, file: multer.File, cb: Function) => {
    crypto.pseudoRandomBytes(16, (err: ?Error, buffer: Buffer) => {
      if (err) return cb(err);
      cb(null, `${buffer.toString("hex")}.${mime.getExtension(file.mimetype)}`);
    });
  },
});

const upload = multer({ storage });

import jwt from "./middlewares/jwt";
import { getLibrary, getAlbum, uploadMusic } from "./controllers/library";
import {
  getUserAllPlaylists,
  getUserPlaylist,
  addPlaylist,
  addTrackToPlaylist,
  removeUserPlaylist,
  removeTrackFromPlaylist,
} from "./controllers/playlist";
import search from "./controllers/search";
import {
  initPushService,
  getVapidKeys,
  subscribe,
  unsubscribe,
} from "./controllers/push-notifications";

const app = express();
const server = http.createServer(app);
const router = express.Router();

const PORT = 5000;
const corsOptions = {
  origin: (origin: cors.CorsOptions, cb: Function) => {
    if (!origin) {
      cb(null, false);
      return;
    }

    const u = url.parse(origin);
    cb(
      null,
      u.hostname == "localhost" ||
        u.hostname == "127.0.0.1" ||
        u.hostname == "www.streamwave.be" ||
        u.hostname == "streamwave.be" ||
        u.hostname == "staging.streamwave.be"
    );
  },
  allowedHeaders: ["Content-Type", "Authorization", "x-push-id"],
  exposedHeaders: ["x-push-id"],
};

// init push notification service
initPushService().catch((err) => console.error(err));

router.use(cors(corsOptions));
router.use(bodyParser.json());
//router.use(jwt);

router.get("/health", (req, res) => res.send("library api is up !\n"));
router.get("/library", jwt, getLibrary);
router.get("/album/:id", jwt, getAlbum);
router.get("/playlists", jwt, getUserAllPlaylists);
router.get("/playlist/:id", jwt, getUserPlaylist);
router.delete("/playlist/:id", jwt, removeUserPlaylist);

router.get("/search/:term", jwt, search);
router.post("/playlist", jwt, addPlaylist);
router.post("/playlist/:playlistId", jwt, addTrackToPlaylist);
router.delete("/playlist/:playlistId/:trackId", jwt, removeTrackFromPlaylist);

router.get("/push", getVapidKeys);
router.post("/push/subscribe", jwt, subscribe);
router.post("/push/unsubscribe", jwt, unsubscribe);

router.post("/album/upload", jwt, upload.array("musics"), uploadMusic);

app.use(router);

server.listen(5000, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});
