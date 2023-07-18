import { promises as fs } from "fs";

import { getPlaylists } from "./index.js";

const generatePlaylistsFile = async (channelName) => {
    const playlists = await getPlaylists(channelName);

    fs.writeFile(`./playlists/${channelName}.json`,
        JSON.stringify(playlists, null, "\t"),
        (err) => {
            if (err) console.error(err);
    });

    return playlists;
};

export default generatePlaylistsFile;