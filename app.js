if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) { }
const express = require("express");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ExpresError = require("./utills/expressError");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const Listing = require("./models/listing");

const listings = require("./public/routes/listing.js");
const reviews = require("./public/routes/review.js");
const userRoutes = require("./public/routes/user.js");
const dbUrl = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wonderlust";

main()
    .then(() => {
        console.log("connected to DB");

    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(dbUrl)
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const secret = process.env.SECRET || "mysupersecretcode";

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: secret
    },
    touchAfter: 24 * 3600,
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionOptions = {
    store: store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
    },
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async (req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    try {
        const locations = await Listing.distinct('location');
        const countries = await Listing.distinct('country');
        res.locals.allDestinations = [...new Set([...locations, ...countries])].filter(Boolean).sort();
    } catch (error) {
        console.error("Failed to fetch destinations for search dropdown:", error);
        res.locals.allDestinations = [];
    }
    next();
});

//  app.get("/demouser", async (req, res) => {
//      try {
//          const registereduser = await User.register({ username: "fakeuser", email: "fakeuser@example.com" }, "password");
//          return res.send(registereduser);
//      } catch (e) {
//          return res.status(500).send({ error: e.message });
//      }

//  });


app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", userRoutes);

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// 404 handler - must be before error handler
app.use((req, res, next) => {
    next(new ExpresError(404, "Page Not Found"));
});

// Global error handler middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message, statusCode });
});

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

