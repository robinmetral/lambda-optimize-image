const readChunk = require("read-chunk");
const fileType = require("file-type");

const generateFileName = date => {
  // check if date
  if (typeof date.getUTCMonth !== "function") {
    throw new Error("Can't generate file name, input is not a date");
  }
  // add leading zeroes if needed
  const pad = n => (n < 10 ? `0${n}` : n);
  // extract date values
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getSeconds());
  // return file name
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
};

const getFileType = file => {
  const buffer = readChunk.sync(file, 0, fileType.minimumBytes);
  const type = fileType(buffer);
  return type.mime;
};

const isValidFileType = mimeType => {
  const ACCEPTED_MIME_TYPES = ["image/jpeg"];
  return ACCEPTED_MIME_TYPES.includes(mimeType);
};

module.exports = {
  generateFileName,
  getFileType,
  isValidFileType
};
