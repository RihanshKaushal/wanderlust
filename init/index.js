require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch(e) {}
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MAPTILER_API_KEY = process.env.MAPTILER_API_KEY;

const MONGO_URL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wonderlust";

async function initDB() {
  try {
    // Delete existing data
    await Listing.deleteMany({});
    await User.deleteMany({});
    
    // Create a sample user
    const user = new User({
      email: "demo@example.com",
      username: "demouser"
    });
    
    // Register the user with password
    await User.register(user, "demopass123");
    console.log("User created:", user._id);
    
    // Add owner and geocode each listing
    for (let listing of initData.data) {
      listing.owner = user._id;
      
      // Use existing geometry from data.js if available
      if (!listing.geometry || !listing.geometry.coordinates) {
        if (!MAPTILER_API_KEY) {
          console.warn(`Skipping geocoding for "${listing.location}" - no MAPTILER_API_KEY set`);
          listing.geometry = { type: "Point", coordinates: [0, 0] };
          continue;
        }
        const locationQuery = encodeURIComponent(listing.location);
        const geocodingUrl = `https://api.maptiler.com/geocoding/${locationQuery}.json?key=${MAPTILER_API_KEY}`;
        
        const response = await fetch(geocodingUrl);
        const geoData = await response.json();
        
        if (geoData.features && geoData.features.length > 0) {
          const { geometry } = geoData.features[0];
          if (geometry && geometry.coordinates && geometry.coordinates.length === 2) {
            listing.geometry = geometry;
          }
        } else {
          throw new Error(`Could not geocode location: "${listing.location}"`);
        }
      }
    }
    
    const result = await Listing.insertMany(initData.data);
    console.log(`Database initialized - ${result.length} listings added`);
  } catch(err) {
    console.error("Error initializing DB:", err.message);
    throw err;
  }
}

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("connected to DB");
  await initDB();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
