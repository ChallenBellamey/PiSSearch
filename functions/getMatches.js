

const newTallyObject = (searchTerms) => searchTerms
    .reduce((tally, searchTerm) => {
        tally[searchTerm] = 0;

        return tally;
    }, {});

const newSearchTermRegexesObject = (searchTerms, isStrict) => searchTerms
    .reduce((searchTermRegexes, searchTerm) => {
        searchTermRegexes[searchTerm] = (isStrict)
            ? new RegExp (`\\b${searchTerm}\\b`, "gi")
            : new RegExp (searchTerm, "gi");

        return searchTermRegexes;
    }, {});

const startTimeEndTimeFilter = (caption, startTime, endTime) => {
    const matchStartTime = (!startTime || (startTime <= caption.time));
    const matchEndTime = (!endTime || (caption.time <= endTime));

    return (matchStartTime && matchEndTime);
};

const matchFilter = ({ text }, index, captions, tally, searchTermRegexes) => (
    Object.keys(searchTermRegexes)
        .reduce((bool, searchTerm) => {
            let termMatches;
            const nextCaption = captions[index + 1];

            if (nextCaption) {
                termMatches = [...[text, nextCaption.text].join(" ").matchAll(searchTermRegexes[searchTerm])];
            } else {
                termMatches = [...text.matchAll(searchTermRegexes[searchTerm])];
            }

            termMatches = termMatches
                .filter(termMatch => (termMatch.index < text.length));

            tally[searchTerm] += termMatches.length;

            return (bool || (termMatches.length > 0));
        }, false)
);

const formatCaption = (caption, videoId, timeOffset) => {
    let { time } = caption;

    time = Math.max(0, time + timeOffset);
    const timeHours = Math.floor(time / 3600);
    const timeMins = Math.floor((time % 3600) / 60);
    const timeSecs = Math.floor((time % 60));
    time = `${timeHours}h${timeMins}m${timeSecs}s`;
    const url = `https://www.youtube.com/watch?v=${videoId}&t=${time}`;

    return {
        ...caption,
        time,
        url,
    };
}

const getMatches = (
        item, 
        searchTerms,
        options = {},
    ) => {
        let { captions, videoId } = item;

        const {
            isStrict = true,
            timeOffset = -10,
            startTime,
            endTime,
        } = options;
        
        const tally = newTallyObject(searchTerms);
        const searchTermRegexes = newSearchTermRegexesObject(searchTerms, isStrict);

        captions = captions
            .filter((caption) => startTimeEndTimeFilter(caption, startTime, endTime))
            .filter((...args) => matchFilter(...args, tally, searchTermRegexes))
            .map((caption) => formatCaption(caption, videoId, timeOffset));

        return {
            captions,
            tally,
        };
};

export default getMatches;