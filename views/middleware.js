const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const ExpresError = require("../utills/expressError");
const {listingSchema ,reviewSchema} = require("../schema.js");

// Middleware: Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to do that");
        return res.redirect("/login");
    }
    next();
};

// Middleware: Save redirect URL after login
module.exports.saveRedirectUrl = async (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// Middleware: Check if user is owner of listing
module.exports.isOwner = async (req, res, next) => {
    try {
        let { id } = req.params;
        let listing = await Listing.findById(id);
        
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }
        
        if (!listing.owner) {
            throw new ExpresError(500, "Listing has no owner");
        }
        
        if (!listing.owner._id.equals(req.user._id)) {
            req.flash("error", "You are not the owner of this listing!");
            return res.redirect(`/listings/${id}`);
        }
        
        next();
    } catch (err) {
        req.flash("error", "Authorization failed: " + err.message);
        return res.redirect("/listings");
    }
};

// Middleware: Check if user is author of review
module.exports.isReviewAuthor = async (req, res, next) => {
    try {
        let { id, reviewId } = req.params;
        
        const review = await Review.findById(reviewId);
        
        if (!review) {
            req.flash("error", "Review not found");
            return res.redirect(`/listings/${id}`);
        }
        
        if (!review.author) {
            throw new ExpresError(500, "Review has no author");
        }
        
        if (!review.author._id.equals(req.user._id)) {
            req.flash("error", "You are not the author of this review!");
            return res.redirect(`/listings/${id}`);
        }
        
        next();
    } catch (err) {
        req.flash("error", "Authorization failed: " + err.message);
        return res.redirect("/listings");
    }
};

// Middleware: Validate listing schema
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpresError(400, error.details[0].message);
    }
    next();
};

// Middleware: Validate review schema
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);    
    if (error) {
        throw new ExpresError(400, error.details[0].message);
    }
    next();
};
