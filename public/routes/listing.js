const express = require("express");
const router = express.Router();
const wrapAsync = require("../../utills/wrapAsync");
const { isLoggedIn, isOwner, validateListing } = require("../../views/middleware.js");
const listingController = require("../../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../../cloudConfig.js");

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files can be uploaded."));
  },
});

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

// new route
router.get("/new", isLoggedIn, listingController.renderNewForm
);


router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// edit route
router.get("/:id/edit", isLoggedIn,
  isOwner,
   wrapAsync(listingController.renderEditForm)
);



module.exports = router;
