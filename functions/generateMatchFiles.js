import fs from "fs";

import { generateCaptionsFile, updateCaptionsFile, getMatches, getPlaylistItems } from "./index.js";

const newTallyObject = (searchTerms) => searchTerms
    .reduce((tally, searchTerm) => {
        tally[searchTerm] = 0;

        return tally;
    }, {});

const getPlaylistCaptionFile = async (list, shouldUpdateCaptions) => {
    const captionsFileExists = fs.existsSync(`./captions/${list}.json`);

    if (captionsFileExists && !shouldUpdateCaptions) {
        return fs.promises.readFile(`./captions/${list}.json`)
            .then(playlistFile => JSON.parse(playlistFile));
    }

    return getPlaylistItems(list)
        .then(async (playlist) => {
            if (captionsFileExists) {
                return fs.promises.readFile(`./captions/${list}.json`)
                    .then(playlistFile => {
                        playlistFile = JSON.parse(playlistFile);
                        const updatesRequired = playlist.items.some((item, index) => item.videoId != playlistFile.items[index]?.videoId);

                        if (!updatesRequired) {
                            return playlistFile;
                        } else {
                            return updateCaptionsFile(playlistFile, playlist);
                        }
                    });
            };

            return generateCaptionsFile(playlist);
        });
};

const startDateEndDateFilter = ({ publishedAt }, startDate, endDate) => {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const publishedAtDateObj = new Date(publishedAt);
    const startDateIsMatch = (!startDate || (startDateObj <= publishedAtDateObj));
    const endDateIsMatch = (!endDate || (publishedAtDateObj <= endDateObj));

    return (startDateIsMatch && endDateIsMatch);
};

const getMatchesReducer = (arr, item, searchTerms, options) => {
    const { captions, tally } = getMatches(item, searchTerms, options);

    if (captions.length) {
        delete item.captions;
        item.tally = tally;
        item.captions = captions;
        arr.push(item);
    }

    return arr;
};

const publishedAtSort = (a, b) => (new Date(a.publishedAt) - new Date(b.publishedAt));

const playlistCaptionFileFilter = (playlistCaptionFile, searchTerms, tally, options) => {
    const { startDate, endDate } = options;

    const items = playlistCaptionFile.items
        .filter((item) => startDateEndDateFilter(item, startDate, endDate))
        .reduce((arr, item) => getMatchesReducer(arr, item, searchTerms, options), []);

    delete playlistCaptionFile.items;

    playlistCaptionFile.tally = items
        .reduce((tally, item) => {
            Object.keys(tally).forEach(searchTerm => tally[searchTerm] += item.tally[searchTerm]);

            return tally;
        }, { ...tally });

    playlistCaptionFile.items = items
        .sort(publishedAtSort);

    return playlistCaptionFile.items.length;
};

const sortByPlaylistReducer = (matches, playlistCaptionFile, sortByPlaylist) => {
    if (sortByPlaylist) {
        matches.push(playlistCaptionFile);
    } else {
        matches.push(...playlistCaptionFile.items);
    }

    return matches;
};

const matchCountSort = (a, b) => {
    const aMatches = Object.values(a.tally).reduce((acc, num) => (acc + num));
    const bMatches = Object.values(b.tally).reduce((acc, num) => (acc + num));

    return bMatches - aMatches;
};

const matchesSummaryReducer = (acc, playlist) => {
    acc.titles.push(playlist.title);
    Object.keys(acc.tally).forEach(searchTerm => acc.tally[searchTerm] += playlist.tally[searchTerm]);

    return acc;
};

const generateSummary = (playlistCaptionFiles, matches, tally, dir, options, sortByPlaylist) => {

    const matchesSummary = playlistCaptionFiles
        .reduce(matchesSummaryReducer, {
            titles: [],
            date: new Date().toISOString(),
            options,
            tally: { ...tally },
        });

    const summary = {
        ...matchesSummary,
        matches,
    };

    fs.writeFile((dir + "_Summary.txt"),
        JSON.stringify(summary, (k, v) => (sortByPlaylist && (k === 'items')) ? undefined : v, "\t"),
        (err) => {
            if (err) console.error(err);
    });
};

const generateMatchFile = (match, dir) => {
    const correctedFileName = `${match.title}.txt`.replace(/(\/|:)/g, " ");

    fs.writeFile((dir + correctedFileName),
        JSON.stringify(match, null, "\t"),
        (err) => {
            if (err) console.error(err);
    });
};

const generateMatchFiles = async (
    lists,
    searchTerms,
    options = {},
) => {
    const {
        shouldUpdateCaptions = false,
        sortByPlaylist = true,
        sortByMatchCount = false,
    } = options;

    const playlistCaptionFiles = await Promise.all(
        lists.map((list) => getPlaylistCaptionFile(list, shouldUpdateCaptions))
    );

    const tally = newTallyObject(searchTerms);
    
    const matches = playlistCaptionFiles
        .filter((playlistCaptionFile) => playlistCaptionFileFilter(playlistCaptionFile, searchTerms, tally, options))
        .reduce((matches, playlistCaptionFile) => sortByPlaylistReducer(matches, playlistCaptionFile, sortByPlaylist), [])
        .sort(publishedAtSort);

    if (sortByMatchCount) {
        matches.sort(matchCountSort);
    }

    const searchTermsString = `'${searchTerms.join("','")}'`;
    const dir = `./matches/[${searchTermsString}]/`;
    const directoryExists = fs.existsSync(dir);

    if (!directoryExists) {
        if (!fs.existsSync("./matches")) {
            fs.mkdirSync("./matches");
        }

        fs.mkdirSync(dir);
    }

    generateSummary(playlistCaptionFiles, matches, tally, dir, options, sortByPlaylist);

    if (sortByPlaylist) {
        matches.forEach((match) => generateMatchFile(match, dir));
    }
};

export default generateMatchFiles;