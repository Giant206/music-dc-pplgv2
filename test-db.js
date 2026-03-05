/**
 * Test MongoDB Connection
 */
const config = require('./src/settings/config');
const db = require('./src/database/profile');

console.log("Testing MongoDB Connection...");
console.log("Config:", config.mongoUri);

db.initDatabase(config)
  .then(success => {
    if (success) {
      console.log("✅ MongoDB Connected Successfully!");
      
      // Test getProfile
      db.getProfile("123456789").then(profile => {
        console.log("Profile test:", profile);
        process.exit(0);
      });
    } else {
      console.log("❌ MongoDB Connection Failed!");
      process.exit(1);
    }
  })
  .catch(err => {
    console.error("Error:", err);
    process.exit(1);
  });

