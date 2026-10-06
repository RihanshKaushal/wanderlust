const Listing = require("../models/listing.js");

const MAPTILER_API_KEY = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
  const { category, search } = req.query;
  let filter = {};

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter = {
      $or: [
        { title: { $regex: searchRegex } },
        { location: { $regex: searchRegex } },
        { country: { $regex: searchRegex } }
      ]
    };
  } else if (category) {
    filter = { category };
  }

  const allListings = await Listing.find(filter);

  if (allListings.length === 0) {
    if (search) {
      req.flash("error", `No destinations found matching your search: "${search}"`);
      return res.redirect("/listings");
    } else if (category) {
      req.flash("error", `No listings found for the category: "${category}"`);
      return res.redirect("/listings");
    }
  }

  res.render("listings/index.ejs", { allListings, category: category || '' });
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  
  let ownerName = listing.owner ? listing.owner.username : "Unknown Owner";
  let isOwner = false;
  if (req.user && listing.owner) {
    isOwner = req.user._id.equals(listing.owner._id);
  }
  


  res.render("listings/show.ejs", {
    listing,
    mapTilerKey: MAPTILER_API_KEY, // Ensure this is passed
    ownerName,
    isOwner,
  });
}; 
module.exports.createListing = async (req, res, next) => {
    const locationQuery = encodeURIComponent(req.body.listing.location);
    const geocodingUrl = `https://api.maptiler.com/geocoding/${locationQuery}.json?key=${MAPTILER_API_KEY}`;
    
    const response = await fetch(geocodingUrl);
    const geoData = await response.json();

    if (!geoData.features || !geoData.features.length) {
      req.flash("error", "Invalid location. Please provide a valid location.");
      return res.redirect("/listings/new");
    }

    const listingData = req.body.listing;
    
    // Set default image values if not provided
    if (!listingData.image) {
      listingData.image = {};
    }
    if (!listingData.image.filename) {
      listingData.image.filename = "listing-image";
    }
    if (!listingData.image.url) {
      listingData.image.url = "https://via.placeholder.com/400x300?text=No+Image";
    }

    if (req.file) {
      listingData.image = {
        filename: req.file.filename,
        url: req.file.path,
      };
    }
    
    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;
    newListing.geometry = geoData.features[0].geometry;

    // Ensure geometry is valid before saving
    if (!newListing.geometry || !newListing.geometry.coordinates || newListing.geometry.coordinates.length !== 2) {
      req.flash("error", "Could not determine coordinates for the provided location.");
      return res.redirect("/listings/new");
    }
    await newListing.save();
    req.flash("success", "new Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
};
 
  module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
   originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    // Get all possible categories from the schema
    const allCategories = Listing.schema.path('category').enumValues;

    res.render("listings/edit.ejs", { listing, originalImageUrl, allCategories });
    };

    module.exports.updateListing = async (req, res, next) => {
    let { id } = req.params;
    const listingData = req.body.listing;
    
    if (listingData.location) {
      const locationQuery = encodeURIComponent(listingData.location);
      const geocodingUrl = `https://api.maptiler.com/geocoding/${locationQuery}.json?key=${MAPTILER_API_KEY}`;
      
      const response = await fetch(geocodingUrl);
      const geoData = await response.json();

      if (!geoData.features || !geoData.features.length) {
        req.flash("error", "Invalid location. Please provide a valid location.");
        return res.redirect(`/listings/${id}/edit`);
      }
      listingData.geometry = geoData.features[0].geometry;
    }

    if (req.file) {
      listingData.image = {
        filename: req.file.filename,
        url: req.file.path,
      };
    } else {
      // Keep the old image if a new one is not uploaded
    }
    
    const listing = await Listing.findByIdAndUpdate(id, listingData, { runValidators: true });

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id)
    console.log(deletedListing)
    req.flash("success", "Listing deleted successfully!");
    res.redirect("/listings")
};
