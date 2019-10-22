const db = require('../../data/models')('room');

// const getsubject = id => {
//   return db.cb(async (db) => {
//     const actions = await db('action')
//       .where('subject_id', id);
//     const subject = await db('subject')
//       .where('id', id)
//       .first();

//     return {
//       ...subject,
//       actions,
//     };
//   });
// };

module.exports = {
  ...db,
  // getsubject,
};
