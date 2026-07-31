const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        filename: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            default: "https://via.placeholder.com/400x300?text=No+Image",
        },
    },
    location: {
        type: String,
        required: true,
    },
    country:String,
    // GeoJSON point returned by MapTiler Geocoding: [longitude, latitude]
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:"Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: String,
        enum: ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing pools", "Camping", "Arctic", "Farms", "Boats"]
    },


});
 listingSchema.post("findOneAndDelete", async (listing )=>{
    if(listing){
        await Review.deleteMany({
            _id:{
                $in:listing.reviews
            }
        })
    }
 });





const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
