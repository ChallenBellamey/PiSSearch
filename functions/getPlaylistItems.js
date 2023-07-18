import axios from "axios";

import auth from "../auth.json" assert { type: "json" };

const { apiKey } = auth;
const playlistsUrl = "https://www.googleapis.com/youtube/v3/playlists";
const playlistItemsUrl = "https://www.googleapis.com/youtube/v3/playlistItems";

const getPlaylistData = async (id) => {
    const { data: { items: [{ snippet }] } } = await axios
        .get(playlistsUrl, {
            params: {
                part: "snippet",
                id,
                key: apiKey,
            }
        });

    return snippet;
};

const getPlaylistItemsData = async (playlistId, pageToken) => {
    const { data, data: { pageInfo: { totalResults } } } = await axios
        .get(playlistItemsUrl, {
            params: {
                part: "contentDetails,snippet",
                playlistId,
                key: apiKey,
                pageToken,
            }
        });

    return {
        ...data,
        totalResults,
    };
};

const formatPlaylistItems = (items) => {
    return items
        .map(({
            snippet: {
                title,
                resourceId: {
                    videoId,
                },
            },
            contentDetails: {
                videoPublishedAt: publishedAt,
            },
        }) => ({
            publishedAt,
            title,
            videoId,
            url: `https://youtube.com/watch?v=${videoId}`,
        }));
};

const getPlaylistItems = async (list) => {
    const { publishedAt, title } = await getPlaylistData(list);
    console.log(`Getting playlist items for ${title} (0%)`);
    let { items, nextPageToken: pageToken, totalResults } = await getPlaylistItemsData(list);

    while (pageToken) {
        const progress = Math.floor((items.length / totalResults) * 100);
        console.log(`Getting playlist items for ${title} (${progress}%)`);
    
        const { items: nextItems, nextPageToken } = await getPlaylistItemsData(list, pageToken);
        
        items.push(...nextItems);
        pageToken = nextPageToken;
    };
    
    console.log(`Getting playlist items for ${title} (100%)`);

    return {
        publishedAt,
        title,
        list,
        url: `https://youtube.com/playlist?list=${list}`,
        items: formatPlaylistItems(items),
    };
};

export default getPlaylistItems;