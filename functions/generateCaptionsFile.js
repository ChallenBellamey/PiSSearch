import fs, { promises } from "fs";

import { getCaptions } from "./index.js";

const generateCaptionsFile = async (playlist) => {

    for (const i in playlist.items) {
        const item = playlist.items[i];
        const progress = Math.floor((i / playlist.items.length) * 100);
        console.log(`Getting captions for ${playlist.title} (${progress}%)`);
        item.captions = await getCaptions(item.videoId);
    }
    
    console.log(`Getting captions for ${playlist.title} (100%)`);

    const dir = `./captions/`;
    const directoryExists = fs.existsSync(dir);

    if (!directoryExists) {
        fs.mkdirSync(dir);
    }

    await promises.writeFile(`./captions/${playlist.list}.json`,
        JSON.stringify(playlist, null, "\t"),
        (err) => {
            if (err) console.error(err);
    });

    return playlist;
};

export default generateCaptionsFile;