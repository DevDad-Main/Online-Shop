import { User } from "../models/user.models.js";

export function getLogin(req, res, next) {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
  });
}

export function postLogin(req, res, next) {
  User.findById("686ee4f824d7509e3e24abf9")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      //INFO: Don't normally need to call this as it is done automatically. But you may need to do it in some scenarios where you need to be sure that your session was created before we continue. As redirect executes directly and some cases it might not have time to bringn the data back from mongodb
      req.session.save((err) => {
        console.log(err);
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
}

export function postLogout(req, res, next) {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
}
