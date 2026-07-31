const express =require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.get("/", (req, res) => {
  res.send("Hello from root!");
});

const sessionOptions = {
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true
};

app.use(session(sessionOptions));
app.use(flash());
app.use((req, res, next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    next();
    });



app.get("/register", (req, res) => {
    let{ name="anoymous"}= req.query;
    req.session.name = name;
    
    if(name === "anoymous"){
req.flash("error", "There was an error registering you.");
    }else{
req.flash("success", "You have been registered successfully!");
    }
    
    res.redirect("/hello");
});
app.get("/hello", (req, res) => {
    res.render("page.ejs", { name: req.session.name });
 });


app.listen(3000,() => {
    console.log("Server is running on port 3000");
});