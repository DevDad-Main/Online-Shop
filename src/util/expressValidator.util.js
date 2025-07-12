import { check, body } from "express-validator";

export const signupValidation = [
  check("email").isEmail().withMessage("Please enter a valid email."),
  body(
    "password",
    "Please enter a password with only numbers and text and at least 5 characters.",
  ).isLength({ min: 6, max: 12 }),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords have to match!");
    }
    return true;
  }),
];
