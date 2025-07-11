import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import sendEmail from "../util/mailjet.util.js";

export function getLogin(req, res, next) {
  let message = req.flash("error");
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message.length > 0 ? message[0] : null,
  });
}

export function postLogin(req, res, next) {
  const { email, password } = req.body;

  User.findOne({
    email: email,
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            //INFO: Don't normally need to call this as it is done automatically. But you may need to do it in some scenarios where you need to be sure that your session was created before we continue. As redirect executes directly and some cases it might not have time to bringn the data back from mongodb
            return req.session.save((err) => {
              console.log(err);
              return res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password.");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
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
  let message = req.flash("error");
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message.length > 0 ? message[0] : null,
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
        req.flash("error", "E-mail already exists! Please try again.");
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
          return sendEmail({
            toEmail: email,
            subject: "Signup Successful!",
            text: "Thank you for signing up to our shop! Enjoy shopping with us.",
            html: "<h3>Welcome to our store!</h3><p>We’re excited to have you onboard.</p>",
          })
            .then((result) => {
              console.log(result.body);
              res.redirect("/login");
            })
            .catch((err) => {
              console.error("Signup error:", err);
              res.redirect("/signup");
            });
        });
    })
    .catch((err) => console.log(err));
}
