import { promises as fs } from "fs";

import { getCaptions } from "./index.js";

const updateCaptionsFile = async (captionsFile, playlist) => {

    for (const i in playlist.items) {
        const playlistItem = playlist.items[i];
        const progress = Math.floor((i / playlist.items.length) * 100);

        const existingCaptions = captionsFile.items
            .find(fileItem => fileItem.videoId === playlistItem.videoId)?.captions;

        if (existingCaptions) {
            playlistItem.captions = existingCaptions;
        } else {
            console.log(`Updating captions for ${playlist.title} (${progress}%)`);

            await getCaptions(playlistItem.videoId)
                .then(captions => {
                    playlistItem.captions = captions;

                    return playlistItem.captions;
                });
        }
    }
    
    console.log(`Updating captions for ${playlist.title} (100%)`);

    await fs.writeFile(`./captions/${playlist.list}.json`,
        JSON.stringify(playlist, null, "\t"),
        (err) => {
            if (err) console.error(err);
    });

    return playlist;
};

export default updateCaptionsFile;