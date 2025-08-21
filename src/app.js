//#region Imports
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import adminRoutes from "./routes/admin.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { get404, get500 } from "./controllers/error.controllers.js";
import { User } from "./models/user.models.js";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
const MongoDBStore = ConnectMongoDBSession(session);
import dotenv from "dotenv";
import Tokens from "csrf";
import flash from "connect-flash";
import multer from "multer";
import helmet from "helmet";
//#endregion

//#region Const Variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tokens = new Tokens();

const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  // Defining a collection where our sessions will be stored
  collection: "sessions",
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "images"));
    // cb(null, __dirname + "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString() +
        "-" +
        file.originalname.slice(file.originalname.indexOf("/images") + 1),
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true); // Accepting these image types
  } else {
    cb(null, false); // Not accepting these image types
  }
};

//#endregion

app.set("view engine", "ejs");
app.set("views", "src/views");

app.use(helmet());

app.use(bodyParser.urlencoded({ extended: false }));
//INFO: Name corresponds to the name of the input field in edit-product view
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"),
);
app.use(express.static(path.join(__dirname, "public")));
// app.use("/images", express.static(path.join(__dirname, "src", "images")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // Session data now will be saved in our store
    store: store,
  }),
);

// app.use((req, res, next) => {
//   //WARN: Generate a CSRF secret if not already set
//   if (!req.session.csrfToken) {
//     req.session.csrfSecret = tokens.secretSync();
//   }
//   //WARN: Generate a token to be sent to the client
//   res.locals.csrfToken = tokens.create(req.session.csrfSecret);
//
//   next();
// });

app.use((req, res, next) => {
  //INFO: Inside of sync code we throw errors like so
  // throw new Error("Dummy");
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      //INFO: Inside on Async code snippets we need to use the error snippets like so
      next(new Error(err));
    });
});

app.use((req, res, next) => {
  const csrfToken = tokens.create(
    req.session.csrfSecret || tokens.secretSync(),
  );
  req.session.csrfSecret ??= tokens.secretSync(); // set if not set
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = csrfToken;
  next();
});

//INFO: The flash is typically used in combination with redirects, ensuring that the message is available to the next page that is to be rendered.
app.use(flash());

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(get404);

app.get("/500", get500);

//NOTE: Error handing middleware that contains 4 args not the standard 3
app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then((result) => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is listening on ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log(err));
