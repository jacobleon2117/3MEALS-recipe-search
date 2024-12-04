require("dotenv").config();
const mongoose = require("mongoose");

async function testMongoConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connection Successful!");

    await mongoose.connection.close();
    console.log("MongoDB Connection Closed");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
}

async function testEdamamAPI() {
  try {
    const query = "chicken";
    const url = `https://api.edamam.com/search?q=${query}&app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.hits) {
      console.log("✅ Edamam API Connection Successful!");
    } else {
      console.log("❌ Edamam API Error: Unexpected response format");
    }
  } catch (error) {
    console.error("❌ Edamam API Error:", error.message);
  }
}

console.log("Testing Connections...");
testMongoConnection();
testEdamamAPI();
