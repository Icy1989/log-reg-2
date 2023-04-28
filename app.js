var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    session = require('express-session'),
    flash = require('connect-flash');

const User = require("./model/fuckyoudb");
var app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/styles"));


mongoose.connect("mongodb://localhost/27017");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: "opeadmin2023",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

// ROUTES

// Showing home page
app.get("/", function (req, res) {
    res.render("home");
});

// Showing register form
app.get("/register", function (req, res) {
    res.render("register");
});

// Handling user signup
app.post("/register", async (req, res) => {
    const user = await User.create({
        username: req.body.username,
        password: req.body.password
    });
    return res.status(200).json(user);
});

//Showing login form
app.get("/login", function (req, res) {
    res.render("login", { message: req.flash('error') });
});

//Handling user login
app.post("/login", async function(req, res){
    try {
        // check if the user exists
        const user = await User.findOne({ username: req.body.username });
        if (user) {
          //check if password matches
          const result = req.body.password === user.password;
          if (result) {
            res.render("dashboard");
          } else {
            res.status(400).json({ error: "password doesn't match" });
          }
        } else {
          res.status(400).json({ error: "User doesn't exist" });
        }
      } catch (error) {
        res.status(400).json({ error });
      }
});

//Showing dashboard
app.get("/dashboard", isLoggedIn, function (req, res) {
    res.render("dashboard");
});

app.get("/logout", function (req, res) {
    req.logout(); // remove user's authentication credentials
    res.redirect("/"); // redirect to home page or login page
});


//Handling user logout
app.get("/logout", function (req, res) {
    req.logout(function(err){
        if(err) console.log(err);
        res.redirect("/");
    });
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server Has Started!");
});
