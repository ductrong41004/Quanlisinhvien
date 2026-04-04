const mongoose = require('mongoose');

async function migrate() {
  await mongoose.connect('mongodb://localhost:27017/quanlysinhvien_v2');
  console.log('Connected to DB');

  const db = mongoose.connection.db;
  const students = db.collection('students');

  // get all students that have 'class' but no 'classes'
  const toUpdate = await students.find({ class: { $exists: true } }).toArray();
  let updated = 0;
  
  for (const st of toUpdate) {
    if (st.class) {
      await students.updateOne(
        { _id: st._id },
        { 
          $set: { classes: [st.class] },
          $unset: { class: "" }
        }
      );
      updated++;
    } else {
       await students.updateOne(
        { _id: st._id },
        { 
          $set: { classes: [] },
          $unset: { class: "" }
        }
      );
    }
  }

  console.log(`Migrated ${updated} students from 'class' to 'classes'.`);
  process.exit(0);
}

migrate().catch(console.error);
