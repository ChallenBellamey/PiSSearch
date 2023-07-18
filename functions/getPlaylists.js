import axios from "axios";

import auth from "../auth.json" assert { type: "json" };

const { apiKey } = auth;
const channelUrl = "https://www.googleapis.com/youtube/v3/channels";
const playlistsUrl = "https://www.googleapis.com/youtube/v3/playlists";

const getChannelData = async (forUsername) => {
    const { data: { items: [{ id }] } } = await axios
        .get(channelUrl, {
            params: {
                forUsername,
                key: apiKey,
            },
        });

    return id;
};

const getPlaylistsData = async (channelId, pageToken) => {
    const { data, data: { pageInfo: { totalResults } } } = await axios
        .get(playlistsUrl, {
            params: {
                part: "snippet",
                channelId,
                key: apiKey,
                pageToken,
            },
        });

    return {
        ...data,
        totalResults,
    };
};

const formatItems = (items) => items
    .sort((a, b) => {
        if (a.snippet.title < b.snippet.title) {
            return -1;
        }

        if (a.snippet.title > b.snippet.title) {
            return 1;
        }

        return 0;
    })
    .reduce((
        items,
        {
            id: list,
            snippet: {
                title,
            },
        },
    ) => {
        items[title] = list;

        return items;
    }, {});

const getPlaylists = async (channelName) => {
    const channelId = await getChannelData(channelName);
    console.log(`Getting playlists for ${channelName} (0%)`);
    let { items, nextPageToken: pageToken, totalResults } = await getPlaylistsData(channelId);

    while (pageToken) {
        const progress = Math.floor((items.length / totalResults) * 100);
        console.log(`Getting playlists for ${channelName} (${progress}%)`);

        const { items: nextItems, nextPageToken } = await getPlaylistsData(channelId, pageToken);

        items.push(...nextItems);
        pageToken = nextPageToken;
    };
    
    console.log(`Getting playlists for ${channelName} (100%)`);

    return {
        channelName,
        channelId,
        items: formatItems(items),
    };
};

export default getPlaylists;