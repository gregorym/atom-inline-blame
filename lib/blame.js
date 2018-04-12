'use babel';

import Path from 'path';
import { exec } from 'child_process';

function run(filePath, lineNumber) {
  return new Promise((resolve, reject) => {
    const cmdText = `git blame ${filePath} --line-porcelain -L ${lineNumber},+1`;
    exec(cmdText, { cwd: Path.dirname(filePath) }, (error, stdout, stderr) => {
      if (error) reject();

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

  return obj;
}


export default {
  run
}
