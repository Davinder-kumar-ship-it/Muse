'use strict';
const fs = require('fs');

const writingDataIntoFile = (filepath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, data, 'utf-8', (err) => {
      if (err) reject('file is not written successfully');
      resolve('file successfully written');
    });
  });
};

const writeFile = async (filepath, data) => {
  const statusOfFile = await writingDataIntoFile(filepath, data);
  return statusOfFile;
};

module.exports = { writeFile };
