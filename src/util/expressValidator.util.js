import { check, body } from "express-validator";
import { User } from "../models/user.models.js";

export const postAddEditProduct = [
  body("title").isString().isLength({ min: 3 }).trim(),
  body("imageUrl").isURL(),
  body("price").isFloat(),
  body("description").isLength({ min: 5, max: 120 }).trim(),
];

//#region Post Login Validation
export const postLoginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .trim(),
  body("password")
    .isLength({ min: 5, max: 12 })
    .withMessage("Password must be at least 5 characters long and at most 12."),
];
//#endregion

//#region Post SignupValidation
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
    })
    .normalizeEmail(),
  body(
    "password",
    "Please enter a password with at least 5 characters and at most 12.",
  )
    .isLength({ min: 6, max: 12 })
    .trim(),
  body("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match!");
      }
      return true;
    }),
];
//#endregion
