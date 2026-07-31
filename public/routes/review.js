const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../../utills/wrapAsync");
const ExpresError = require("../../utills/expressError");
const Listing = require("../../models/listing.js");
const Review = require("../../models/review.js");

const{
  validateReview,
  isLoggedIn,
  isReviewAuthor,
}= require("../../views/middleware.js");

const reviewController = require("../../controllers/reviews.js");

// Post route - Create new review (only logged in users)
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

// Delete route - Delete review (only author can delete)
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync( reviewController.destroyReview)
);

module.exports = router;