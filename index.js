const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const mongoose = require("mongoose");
const keys = require("./config/app_keys");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// const User = mongoose.model("User");
require("./models/User");

const users = require("./routes/users");
const login = require("./routes/login");
const logout = require("./routes/logout");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);

const app = express();

// authentication libraries

const bcrypt = require("bcrypt");
const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// session

app.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// controllers

app.use("/api/users", users);
app.use("/api/login", login);
app.use("/api/logout", logout);

// passport local strategy

passport.use(
  new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      // const hash = user.password;
      // bcrypt.compare(password, hash, function(err, res) {
      if (!user.validPassword(password)) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
      // });
    });
  })
);

const PORT = 4000;
app.listen(PORT);
