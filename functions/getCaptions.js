import he from 'he';
import axios from 'axios';
import _ from 'lodash';
import striptags from 'striptags';

const { find } = _;

const getSubtitles = async (
  videoId,
  lang = 'en',
) => {
    const url = `https://youtube.com/watch?v=${videoId}`;
    const { data } = await axios.get(url);

  // * ensure we have access to captions data
  if (!data.includes('captionTracks')) {
    return [];
  }

  const captionRegex = /({"captionTracks":.*isTranslatable":(true|false)}])/;
  const [match] = captionRegex.exec(data);
  const { captionTracks } = JSON.parse(`${match}}`);

  const subtitle =
    find(captionTracks, {
      vssId: `.${lang}`,
    }) ||
    find(captionTracks, {
      vssId: `a.${lang}`,
    }) ||
    find(captionTracks, ({ vssId }) => vssId && vssId.match(`.${lang}`));

  // * ensure we have found the correct subtitle lang
  if (!subtitle || (subtitle && !subtitle.baseUrl)) {
    return [];
  }

  const { data: transcript } = await axios.get(subtitle.baseUrl);

  const lines = transcript
    .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
    .replace('</transcript>', '')
    .split('</text>')
    .filter(line => line && line.trim())
    .map(line => {
      const startRegex = /start="([\d.]+)"/;
      let [, startString] = startRegex.exec(line);
      const time = Number(startString);

      const htmlText = line
        .replace(/<text.+>/, '')
        .replace(/&amp;/gi, '&')
        .replace(/<\/?[^>]+(>|$)/g, '');

      const decodedText = he.decode(htmlText);
      const text = striptags(decodedText);

      return {
        time,
        text,
      };
    });

    return lines;
};

export default getSubtitles;