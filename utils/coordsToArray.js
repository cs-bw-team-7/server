/*
TODO: Future Docs
Simple util to convert from coord string to array with x, y keys
*/
const coordsToArray = string => {
  const coordsArray = string.replace(/\(|\)/g, '').split(',');
  return {
    x: Number(coordsArray[0]),
    y: Number(coordsArray[1]),
  };
};

module.exports = coordsToArray;
