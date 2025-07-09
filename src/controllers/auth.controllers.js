const User = require("../models/user.models");

exports.getLogin = (req, res, next) => {
  console.log("Login page");
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  console.log("Logging in");
  User.findById("686ee4f824d7509e3e24abf9")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  console.log("Logging out");
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
