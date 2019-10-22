/*
TODO: Future Docs
Simple util to convert to/from string/array
*/
const coordsToArray = string => {
  const coordsArray = string.replace(/\(|\)/g, '').split(',');
  return {
    x: Number(coordsArray[0]),
    y: Number(coordsArray[1]),
  };
};

// TODO: Add method to convert from array to string

module.exports = coordsToArray;
