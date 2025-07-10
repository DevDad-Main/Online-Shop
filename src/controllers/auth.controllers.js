import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";

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

export function getSignup(req, res, next) {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
  });
}

export function postSignup(req, res, next) {
  //INFO: 1. Extracting the details passed in from the Login webpage
  const { email, password, confirmPassword } = req.body;

  //INFO:2. Validation
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        console.log("User already exists");
        return res.redirect("/signup");
      }

      //INFO:3. If user already exists(more complex validation later) -> Then we create a new one and save it to DB.
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          //INFO: 4. Redirect to login page to coincidentally login
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
}
