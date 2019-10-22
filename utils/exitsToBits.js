/*
TODO: Future Docs
Simple util function to change exits from arbitrary directions to standard 4 bits
0000 -> NESW where high bit is N and low bit is W with 1 being exit 0 being no exit
*/
const exitsToBits = exits => {
  let exitBits = 0;
  let exitValues = {
    n: 8,
    e: 4,
    s: 2,
    w: 1,
  };

  exits.forEach(exit => {
    // Bitwise OR our current exit and our exit bits
    exitBits |= exitValues[exit];
  });
  return exitBits
}

module.exports = exitsToBits;
