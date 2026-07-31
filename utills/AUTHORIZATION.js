/**
 * Authorization Logic & Middleware Documentation
 * ===============================================
 * 
 * This file explains the complete authorization system for the Wonderlust app.
 */

// =============================================================================
// 1. AUTHENTICATION vs AUTHORIZATION
// =============================================================================

/**
 * AUTHENTICATION: Who are you?
 * - Passport.js handles this
 * - Login/Signup with username & password
 * - Session management
 * 
 * AUTHORIZATION: What are you allowed to do?
 * - Custom middleware in views/middleware.js
 * - Checks if user has permission for specific actions
 */

// =============================================================================
// 2. MIDDLEWARE FUNCTIONS
// =============================================================================

/**
 * isLoggedIn
 * ---------------------------
 * Location: views/middleware.js
 * Purpose: Check if user is authenticated
 * Returns: 
 *   - next() if user is logged in
 *   - redirect to /login if not authenticated
 * 
 * Used in:
 *   - POST /listings (create listing)
 *   - GET /listings/new (show new listing form)
 *   - GET /listings/:id/edit (show edit form)
 *   - PUT /listings/:id (update listing)
 *   - DELETE /listings/:id (delete listing)
 *   - POST /listings/:id/reviews (create review)
 * 
 * Example:
 *   router.get("/new", isLoggedIn, (req, res) => {
 *     res.render("listings/new.ejs");
 *   });
 */

/**
 * isOwner
 * ---------------------------
 * Location: views/middleware.js
 * Purpose: Check if current user is the owner of the listing
 * Parameters: 
 *   - req.params.id (listing ID)
 *   - req.user._id (current user ID)
 * Returns:
 *   - next() if user is the owner
 *   - redirect if user is NOT the owner
 * 
 * Checks:
 *   1. Listing exists
 *   2. Listing has an owner
 *   3. Current user's ID matches listing owner's ID
 * 
 * Used in:
 *   - GET /listings/:id/edit (show edit form)
 *   - PUT /listings/:id (update listing)
 *   - DELETE /listings/:id (delete listing)
 * 
 * Example:
 *   router.get("/:id/edit", isLoggedIn, isOwner, (req, res) => {
 *     // Only listing owner can see this
 *   });
 */

/**
 * isReviewAuthor
 * ---------------------------
 * Location: views/middleware.js
 * Purpose: Check if current user is the author of the review
 * Parameters:
 *   - req.params.reviewId (review ID)
 *   - req.params.id (listing ID)
 *   - req.user._id (current user ID)
 * Returns:
 *   - next() if user is the review author
 *   - redirect if user is NOT the review author
 * 
 * Checks:
 *   1. Review exists
 *   2. Review has an author
 *   3. Current user's ID matches review author's ID
 * 
 * Used in:
 *   - DELETE /listings/:id/reviews/:reviewId (delete review)
 * 
 * Example:
 *   router.delete("/:reviewId", isLoggedIn, isReviewAuthor, (req, res) => {
 *     // Only review author can delete
 *   });
 */

/**
 * saveRedirectUrl
 * ---------------------------
 * Location: views/middleware.js
 * Purpose: Save the original URL before redirecting to login
 * Usage: After login, user is redirected back to the page they requested
 * 
 * Flow:
 *   1. User tries to access /listings/123/edit without being logged in
 *   2. isLoggedIn middleware saves /listings/123/edit to session
 *   3. User is redirected to /login
 *   4. After login, user is redirected back to /listings/123/edit
 */

/**
 * validateListing & validateReview
 * ---------------------------
 * Location: views/middleware.js
 * Purpose: Validate data schema using Joi
 * Returns:
 *   - next() if data is valid
 *   - throws ExpresError if data is invalid
 * 
 * Used in:
 *   - POST /listings (create listing)
 *   - PUT /listings/:id (update listing)
 *   - POST /listings/:id/reviews (create review)
 */

// =============================================================================
// 3. ROUTE-BY-ROUTE AUTHORIZATION MATRIX
// =============================================================================

/**
 * LISTINGS ROUTES
 * ===============
 * 
 * GET /listings
 * - Public: ✅ Anyone can view all listings
 * - Middleware: none
 * 
 * GET /listings/new
 * - Public: ❌ Only logged-in users
 * - Middleware: isLoggedIn
 * 
 * POST /listings
 * - Public: ❌ Only logged-in users
 * - Middleware: isLoggedIn, validateListing
 * - Sets: newListing.owner = req.user._id
 * 
 * GET /listings/:id
 * - Public: ✅ Anyone can view a listing
 * - Middleware: none
 * - Shows: Edit/Delete buttons only if user is owner
 * 
 * GET /listings/:id/edit
 * - Public: ❌ Only listing owner
 * - Middleware: isLoggedIn, isOwner
 * 
 * PUT /listings/:id
 * - Public: ❌ Only listing owner
 * - Middleware: isLoggedIn, isOwner, validateListing
 * 
 * DELETE /listings/:id
 * - Public: ❌ Only listing owner
 * - Middleware: isLoggedIn, isOwner
 * 
 * 
 * REVIEWS ROUTES
 * ==============
 * 
 * POST /listings/:id/reviews
 * - Public: ❌ Only logged-in users
 * - Middleware: isLoggedIn, validateReview
 * - Sets: newReview.author = req.user._id
 * 
 * DELETE /listings/:id/reviews/:reviewId
 * - Public: ❌ Only review author
 * - Middleware: isLoggedIn, isReviewAuthor
 * 
 * 
 * USERS ROUTES
 * ============
 * 
 * GET /signup
 * - Public: ✅ Anyone can view signup form
 * 
 * POST /signup
 * - Public: ✅ Anyone can sign up
 * - Check: Username and email must be unique
 * 
 * GET /login
 * - Public: ✅ Anyone can view login form
 * 
 * POST /login
 * - Public: ✅ Anyone can login
 * - Uses: Passport.js authentication
 * 
 * GET /logout
 * - Public: ✅ Anyone (but only effective if logged in)
 * - Logs out current user
 */

// =============================================================================
// 4. USER PERMISSIONS SUMMARY
// =============================================================================

/**
 * Anonymous User (Not Logged In)
 * ✅ Can:
 *   - View all listings
 *   - View listing details
 *   - View reviews on listings
 *   - Sign up
 *   - Log in
 * 
 * ❌ Cannot:
 *   - Create listing
 *   - Edit listing
 *   - Delete listing
 *   - Create review
 *   - Delete review
 * 
 * 
 * Logged-In User
 * ✅ Can:
 *   - View all listings
 *   - Create new listing (becomes owner)
 *   - Create review on any listing
 *   - Edit own listing
 *   - Delete own listing
 *   - Delete own review
 *   - Log out
 * 
 * ❌ Cannot:
 *   - Edit other user's listing
 *   - Delete other user's listing
 *   - Delete other user's review
 * 
 * 
 * Listing Owner
 * ✅ Can (in addition to logged-in permissions):
 *   - Edit their own listing
 *   - Delete their own listing
 *   - View who reviewed their listing
 * 
 * 
 * Review Author
 * ✅ Can (in addition to logged-in permissions):
 *   - Delete their own review
 */

// =============================================================================
// 5. ERROR HANDLING IN AUTHORIZATION
// =============================================================================

/**
 * Authorization failures are handled gracefully:
 * 
 * 1. User not logged in
 *    - Redirect to /login with message: "You must be logged in to do that"
 *    - Session stores original URL for post-login redirect
 * 
 * 2. User is not the owner/author
 *    - Flash error message: "You are not the owner/author of this..."
 *    - Redirect back to the resource page
 * 
 * 3. Resource not found
 *    - Flash error message: "Listing/Review not found"
 *    - Redirect to /listings
 * 
 * All errors are caught by global error handler and logged
 */

// =============================================================================
// 6. FLOW EXAMPLES
// =============================================================================

/**
 * EXAMPLE 1: Creating and Editing a Listing
 * ==========================================
 * 
 * Step 1: User visits /listings/new
 *   - isLoggedIn checks if authenticated
 *   - If no: redirect to /login
 *   - If yes: show form
 * 
 * Step 2: User submits form (POST /listings)
 *   - isLoggedIn checks if authenticated
 *   - validateListing checks data schema
 *   - Create new listing with owner = req.user._id
 *   - Redirect to /listings
 * 
 * Step 3: User visits /listings/:id/edit
 *   - isLoggedIn checks if authenticated
 *   - isOwner checks if user is listing owner
 *   - If not owner: flash error, redirect to listing page
 *   - If owner: show edit form
 * 
 * Step 4: User submits edit form (PUT /listings/:id)
 *   - isLoggedIn checks if authenticated
 *   - isOwner checks if user is listing owner
 *   - validateListing checks data schema
 *   - Update listing
 *   - Redirect to listing page
 */

/**
 * EXAMPLE 2: Adding and Deleting a Review
 * ========================================
 * 
 * Step 1: User visits /listings/:id
 *   - Reviews are displayed (public view)
 *   - If not logged in: hide review form
 *   - If logged in: show review form
 * 
 * Step 2: Logged-in user submits review (POST /listings/:id/reviews)
 *   - isLoggedIn checks if authenticated
 *   - validateReview checks review data
 *   - Create new review with author = req.user._id
 *   - Add review to listing's reviews array
 *   - Redirect to listing page
 * 
 * Step 3: User wants to delete review (DELETE /listings/:id/reviews/:reviewId)
 *   - isLoggedIn checks if authenticated
 *   - isReviewAuthor checks if user is review author
 *   - If not author: flash error, redirect to listing page
 *   - If author: delete review from listing and database
 *   - Redirect to listing page
 */

// =============================================================================
// 7. SECURITY CONSIDERATIONS
// =============================================================================

/**
 * ✅ What's Protected:
 * 1. All modification endpoints check authentication
 * 2. Each user can only modify their own content
 * 3. Database queries verify ownership before allowing changes
 * 4. Invalid input is validated before processing
 * 5. All errors are caught and logged
 * 
 * ⚠️ Best Practices to Follow:
 * 1. Always use isLoggedIn before any protected route
 * 2. Always use isOwner for user-specific resources
 * 3. Always validate input before database operations
 * 4. Always check resource existence before modifying
 * 5. Always wrap async routes with wrapAsync
 * 6. Never trust req.body directly - validate it
 * 7. Never modify req.user directly from client input
 */

// =============================================================================
// 8. HOW TO ADD NEW AUTHORIZATION RULES
// =============================================================================

/**
 * Step 1: Define the requirement
 *   Example: "Only listing owner can add co-owners"
 * 
 * Step 2: Create middleware if needed
 *   Example: Create isListingOwner middleware (or use existing isOwner)
 * 
 * Step 3: Apply middleware to route
 *   router.post("/:id/co-owners", isLoggedIn, isOwner, (req, res) => {
 *     // Only executed if user is logged in AND is listing owner
 *   });
 * 
 * Step 4: Test the authorization
 *   - Test as anonymous user (should fail)
 *   - Test as non-owner (should fail)
 *   - Test as owner (should succeed)
 */

module.exports = {
  authorizationGuide: "See this file for complete authorization documentation"
};
