import { generateMatchFiles, generatePlaylistsFile } from "./functions/index.js";

import { PsychologyInSeattle } from "./playlists/index.js";
const allPlaylists = Object.values(PsychologyInSeattle.items);

const searchTerms = [
    "there's your cake",
    "hand in a glove",
    "yikes",
];

// Uncomment the options below to modify instructions

const options = {
    // shouldUpdateCaptions: true, // Set to true when running for the first time after change has been made to playlist being searched
    // sortByPlaylist: false, // When true (default), results are grouped by which playlist they are in
    // sortByMatchCount: true, // When true, videos/playlists with the most matches will be listed first
    // isStrict: false, // When true (default), only whole words will be matched
    // timeOffset: -10, // Time to offset the url timestamp in seconds, number
    // startDate: "2023-01-01", // Format YYYY-MM-DD, string
    // endDate: "2023-04-01", // Format YYYY-MM-DD, string
    // startTime: 300, // Time into the video in seconds, number
    // endTime: 600, // Time into the video in seconds, number
};

// generatePlaylistsFile("PsychologyInSeattle"); // Run this line once when a new playlist has been added to the channel

// generateMatchFiles(allPlaylists, searchTerms, options); // Run this line to search through all playlists on channel, make sure to not run the lines below at the same time

generateMatchFiles([
    PsychologyInSeattle.items["Angela and Michael (90 Day Fiancé)"], // Type the exact name of the playlist
    PsychologyInSeattle.items["Ed & Rose (90 Day Fiancé)"], // Multiple playlists can be listed like this
], searchTerms, options);