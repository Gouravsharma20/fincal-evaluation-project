// scripts/migrate_add_clientSecret_and_assignAdmin.js
const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const adminConst = require("../constants/admin");
const crypto = require("crypto");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yourdb";

async function run() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected");

  const cursor = Ticket.find().cursor();
  let count = 0;
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    let changed = false;
    if (!doc.clientSecret) {
      doc.clientSecret = crypto.randomBytes(16).toString("hex");
      changed = true;
    }
    if (!doc.assignedToId) {
      doc.assignedToType = "admin";
      doc.assignedToId = adminConst.ADMIN_ID;
      changed = true;
    }
    if (changed) {
      await doc.save();
      count++;
    }
  }
  console.log(`Updated ${count} tickets`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
