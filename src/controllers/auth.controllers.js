import { User } from "../models/user.models.js";
import bcrypt from "bcryptjs";
import sendEmail from "../util/mailjet.util.js";
import crypto from "crypto";
import { validationResult } from "express-validator";
import { errorWrapper } from "../util/error.util.js";

//#region Get Login
export function getLogin(req, res, next) {
  let message = req.flash("error");
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message.length > 0 ? message[0] : null,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
}
//#endregion

//#region Post Login
export function postLogin(req, res, next) {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  }

  User.findOne({
    email: email,
  })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "Invalid email or password.",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [],
        });
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
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Invalid email or password.",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      errorWrapper(next, err);
    });
}
//#endregion

//#region Post Logout
export function postLogout(req, res, next) {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
}
//#endregion

//#region Get Signup
export function getSignup(req, res, next) {
  let message = req.flash("error");
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message.length > 0 ? message[0] : null,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
}
//#endregion

//#region Post Signup
export function postSignup(req, res, next) {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  //INFO: We can start with hashing the password here as we already check for the users exisitnce in the validtor route, the route that get's processed before this one adn obviously if that passes then we will end up here with all of our data
  bcrypt
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
    })
    .catch((err) => {
      errorWrapper(next, err);
    });
}
//#endregion

//#region Get Reset Password
export function getReset(req, res, next) {
  let message = req.flash("error");
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message.length > 0 ? message[0] : null,
  });
}
//#endregion

//#region Post Reset Password
export function postReset(req, res, next) {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour long token for passwd reset
        return user.save();
      })
      .then((result) => {
        return sendEmail({
          toEmail: req.body.email,
          subject: "Password Reset",
          html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
              `,
        })
          .then((result) => {
            res.redirect("/");
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => errorWrapper(next, err));
  });
}
//#endregion

//#region Get New Password
export function getNewPassword(req, res, next) {
  const token = req.params.token;
  //INFO: $gt (Greater Than)
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      res.render("auth/new-password", {
        path: "/new-pasword",
        pageTitle: "Update Password",
        errorMessage: message.length > 0 ? message[0] : null,
        userId: user._id.toString(), // We will use this in the post request to update the password
        passwordToken: token,
      });
    })
    .catch((err) => console.log(err));
}
//#endregion

//#region Post New Password
export function postNewPassword(req, res, next) {
  // const { newPassword, userId, passwordToken } = req.body;
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
      }
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      return sendEmail({
        toEmail: resetUser.email,
        subject: "Password Reset",
        text: "You have successfully updated your password. If this wasn't you please contact us right away.",
      })
        .then((result) => {
          res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      errorWrapper(next, err);
    });
}
//#endregion
