'use babel';

import { distanceInWordsToNow } from 'date-fns';
import Path from 'path';
import { exec } from 'child_process';

function run(filePath, lineNumber) {
  return new Promise((resolve, reject) => {
    const cmdText = `git blame ${filePath} --line-porcelain -L ${lineNumber},+1`;
    exec(cmdText, { cwd: Path.dirname(filePath) }, (error, stdout, stderr) => {
      if (error) {
        console.log(error);
        reject();
      }

      return resolve(parse(stdout));
    });
  });
}

function parse(string) {
  obj = {};

  string.split('\n').forEach((line) => {
    const sepIndex = line.indexOf(' ');
    obj[line.substr(0, sepIndex)] = line.substr(sepIndex + 1);
  });

  return {
    author        : obj['author'],
    authorEmail   : obj['author-mail'],
    authorTime    : obj['author-time'],
    authorTimezone: obj['author-tz'],
    committer     : obj['commiter'],
    summary       : obj['summary'],
  };
}

function shortLine(blameInfo, format = "%author%, %relativeTime% ago - %summary%") {
  let output = format;

  blameInfo.relativeTime = distanceInWordsToNow(new Date(blameInfo.authorTime * 1000));
  blameInfo.author = blameInfo.author === "Unknown" ? blameInfo.authorEmail : blameInfo.author;
  blameInfo.summary = blameInfo.summary.replace(/\"/g, `\\\"`);

  Object.keys(blameInfo).forEach(token => {
    const tokenRe = new RegExp(`%${token}%`, "g");
    output = output.replace(tokenRe, blameInfo[token]);
  });

  return output;
}

export default {
  run,
  shortLine,
}
