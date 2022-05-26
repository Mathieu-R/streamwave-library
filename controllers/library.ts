import { promisify } from "util";
import { exec, spawn } from "child_process";
import path from "path";
import fs from "fs";
import slugify from "slugify";
import mm from "music-metadata";
import sharp from "sharp";

import { push } from "./push-notifications";
import { metadataObject, UPLOAD_PATH } from "../utils";
import { insertAlbumsByUser } from "../seed";

import Album from "../models/Album";
import { Track } from "../models/Track";

const resolvePath = path.resolve;

export function getLibrary(req, res) {
  Album.find({ owner: { $in: ["all", req.user.id] } })
    .limit(10)
    .sort({ created_at: -1 })
    .then((albums) => res.json(albums))
    .catch((err) => console.error(err));
}

export function getAlbum(req, res) {
  const { id } = req.params;

  if (!id) {
    res.status(422).send("album id missing !");
    return;
  }

  Album.findById(id)
    .then((tracks) => res.json(tracks))
    .catch((err) => console.error(err));
}

// only work for 1 album per time
export async function uploadMusic(req, res) {
  const musics = req.files;
  try {
    const { metadatas, album, realAlbumName } = await retrieveMetadata(musics);
    await processFiles({ path: UPLOAD_PATH, album });
    await insertIntoDatabase(
      metadatas,
      req.user.id,
      `${UPLOAD_PATH}/dest/${album}.jpg`
    );
    await uploadToCDN(album);

    if (req.headers["x-push-id"]) {
      const subscriptionId = req.headers["x-push-id"];
      // push notification
      await push(subscriptionId, realAlbumName);
    }

    await clearTempDirectory();
    await fs.mkdirp(UPLOAD_PATH);
    res.status(200).json({ done: true });
  } catch (err) {
    console.error("[ERR UPLOADING] ", err);
    clearTempDirectory()
      .then((_) => fs.mkdirp(UPLOAD_PATH))
      .catch((err) => console.error(err));
    res.status(500).send("Erreur lors de l'importation des musiques");
  }
}

// generates dash manifest
// and different media qualities
// do not think hls manifest is possible here
// cause it only works with mac
// dest files => /tmp/uploads/dest
const processFiles = ({ path: String, album }) => {
  return new Promise((resolve, reject) => {
    const shellScriptPath = resolvePath(__dirname, "../lib/encoder-auto.sh");
    const proc = spawn("sh", [shellScriptPath, path, album]);
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);

    proc.on("close", (_) => resolve());
    // exit even when success (code 0)
    //proc.on('exit', _ => resolve());
    proc.on("error", (err) => reject(err));
  });
};

// retrieve metadata
// from files
const retrieveMetadata = async (musics) => {
  let metadatas = await Promise.all(
    musics.map((music) => {
      const stream = fs.createReadStream(music.path);
      // use the RFC defined mimetype
      // https://stackoverflow.com/questions/10688588/which-mime-type-should-i-use-for-mp3
      const mimetype =
        music.mimetype === "audio/mp3" ? "audio/mpeg" : music.mimetype;
      const metadata = mm.parseStream(stream, mimetype, { duration: true });
      // stream.close makes metadata promise still pending
      return metadata;
    })
  );

  const album = slugify(metadatas[0].common.album, { lower: true });
  const realAlbumName = metadatas[0].common.album;
  const dest = `${UPLOAD_PATH}/dest`;
  // create directory
  await fs.mkdirp(dest);

  metadatas = await Promise.all(
    metadatas.map(async (metadata, index) => {
      const filename = musics[index].filename;
      // in case of single
      metadata.common.album = metadata.common.album || metadata.common.title;
      // optimize image, resize to 300x300 as I do not need more
      // if do not do that I can have a 1.5mb artwork image
      await sharp(metadata.common.picture[0].data)
        .resize(300, 300)
        .toFile(`${dest}/${album}.jpg`);
      // create metadata. remove the extension
      return metadataObject(
        metadata.common,
        metadata.format,
        filename.replace(/\..*$/, "")
      );
    })
  );

  return { metadatas, album, realAlbumName };
};

// insert metadata into database
const insertIntoDatabase = (metadatas, userid, coverPath) => {
  console.log("Inserting into database...");
  return insertAlbumsByUser(metadatas, userid, coverPath);
};

// upload files to cdn
const uploadToCDN = async (album) => {
  if (process.env.NODE_ENV === "production") {
    console.log("Uploading to CDN...");
    const dest = `/var/www/assets/CDN/${album}/`;
    return fs
      .remove(dest)
      .then(async (_) => {
        await fs.move(`${UPLOAD_PATH}/dest/`, dest);
        // give permissions (can be useful for download) (not need it apparently)
        // return promisify(exec)(`chmod -R 777 ${dest}`);
      })
      .catch((err) => console.error(err));
  }

  console.error("upload only works in production mode...");
};

const clearTempDirectory = () => {
  return fs.remove(UPLOAD_PATH);
};
