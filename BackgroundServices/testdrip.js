const mongoose = require('mongoose');
require('dotenv').config();
mongoose.connect(process.env.MONGO_URI || process.env.DB).then(async () => {
  const Campaign = require('./models/Campaign');
  const c = await Campaign.findOne().sort({ createdAt: -1 });
  if (!c) { console.log('No campaigns found'); process.exit(1); }
  c.dripEnabled = true;
  c.sentAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  await c.save();
  console.log('Updated:', c.subject);
  console.log('Recipients:', c.recipients.length);
  console.log('sentAt:', c.sentAt);
  process.exit(0);
});
