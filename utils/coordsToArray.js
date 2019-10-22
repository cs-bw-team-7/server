/*
TODO: Future docs
Simple util to convert from coord string to array with x, y keys
*/
const coordsToArray = string => {
  const coordsArray = string.replace(/\(|\)/g, '').split(',');
  return {
    x: coordsArray[0],
    y: coordsArray[1],
  };
};
