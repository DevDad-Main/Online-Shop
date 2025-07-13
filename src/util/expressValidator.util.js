import { check, body } from "express-validator";
import { User } from "../models/user.models.js";

export const postLoginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email address."),
  body("password")
    .isLength({ min: 5, max: 12 })
    .withMessage("Password must be at least 5 characters long and at most 12."),
];

export const postSignupValidation = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .custom((value, { req }) => {
      //INFO: Here we can return the User as the custom will check for true or false returns, a thrown error or to promise
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("E-mail already exists! Please try again.");
        }
      });
    }),
  body(
    "password",
    "Please enter a password with at least 5 characters and at most 12.",
  ).isLength({ min: 6, max: 12 }),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords have to match!");
    }
    return true;
  }),
];
