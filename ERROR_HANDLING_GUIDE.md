# Error Handling & Crash Prevention Guide

## Overview
Your app now has comprehensive error handling to prevent crashes while maintaining code functionality.

## What Was Added

### 1. **Global Error Handler Middleware** (app.js)
- Catches all Express route errors
- Logs errors with timestamps and request details
- Renders error page without crashing
- Automatically attached to all routes

### 2. **Uncaught Exception Handler**
```javascript
process.on("uncaughtException", (err) => { ... })
```
- Catches errors that occur outside of Express routes
- Logs the error and keeps app running
- Prevents immediate crash

### 3. **Unhandled Promise Rejection Handler**
```javascript
process.on("unhandledRejection", (reason, promise) => { ... })
```
- Catches async/await failures not handled by `try-catch`
- Logs the error and keeps app running
- Prevents silent failures

### 4. **404 Not Found Handler**
- Catches requests to non-existent routes
- Returns user-friendly 404 error page
- Must be placed before error handler middleware

### 5. **Error Logger Utility** (utills/errorLogger.js)
- Saves all errors to log files (logs/error-YYYY-MM-DD.log)
- Includes timestamps and stack traces
- Helps with debugging and monitoring

### 6. **Graceful Shutdown Handler**
- Properly closes database connections on SIGTERM
- Ensures no data loss during shutdown
- Allows pending requests to complete

## Best Practices to Follow

### ✅ Always Use wrapAsync for Async Routes
```javascript
// GOOD - Uses wrapAsync
router.get("/:id", wrapAsync(async (req, res) => {
  const data = await Listing.findById(req.params.id);
  res.send(data);
}));

// BAD - No error handling
router.get("/:id", async (req, res) => {
  const data = await Listing.findById(req.params.id);
  res.send(data);
});
```

### ✅ Throw Custom Errors in Middleware
```javascript
const { isLoggedIn } = require("../views/middleware.js");

router.post("/", isLoggedIn, wrapAsync(async (req, res) => {
  // Your code here
}));
```

### ✅ Validate Input and Throw Errors
```javascript
const ExpresError = require("../utills/expressError");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpresError(400, errMsg);
  }
  next();
};
```

### ✅ Check for NULL Values
```javascript
const listing = await Listing.findById(req.params.id);
if (!listing) {
  throw new ExpresError(404, "Listing not found");
}
```

## Error Flow Diagram
```
User Request
    ↓
[Express Route Handler]
    ↓
[If error occurs] → wrapAsync catches it
    ↓
[Error Handler Middleware] 
    ↓
[logError utility] (saves to file)
    ↓
[Render error.ejs page]
    ↓
User sees friendly error message
```

## Viewing Error Logs
Errors are automatically logged to: `logs/error-YYYY-MM-DD.log`

Example log entry:
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "type": "EXPRESS_ERROR",
  "message": "Listing not found",
  "stack": "Error: Listing not found...",
  "statusCode": 404,
  "method": "GET",
  "url": "/listings/invalid-id"
}
```

## Common Error Codes
- **400**: Bad Request (validation error)
- **401**: Unauthorized (not logged in)
- **403**: Forbidden (no permission)
- **404**: Not Found (resource doesn't exist)
- **500**: Server Error (unexpected error)

## Testing Error Handling
1. Navigate to a non-existent route → should show 404 page
2. Submit invalid data → should show validation error
3. Access protected route without login → should show 401 error
4. Try to access non-existent listing → should show 404 error

## Important Files Modified
- ✅ `app.js` - Added global handlers
- ✅ `utills/errorLogger.js` - Created error logging utility

## Your Existing Code Still Works
- All your route handlers remain unchanged
- All your middleware remains unchanged
- All your database queries remain unchanged
- **No breaking changes!**
