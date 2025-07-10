import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import adminRoutes from "./routes/admin.routes.js";
import shopRoutes from "./routes/shop.routes.js";
import authRoutes from "./routes/auth.routes.js";
import errRoutes from "./routes/err.routes.js";
import { User } from "./models/user.models.js";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
const MongoDBStore = ConnectMongoDBSession(session);
import dotenv from "dotenv";
import Tokens from "csrf";

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

app.set("view engine", "ejs");
app.set("views", "src/views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "secret session",
    resave: false,
    saveUninitialized: false,
    // Session data now will be saved in our store
    store: store,
  }),
);
app.use((req, res, next) => {
  //WARN: Generate a CSRF secret if not already set
  if (!req.session.csrfToken) {
    req.session.csrfSecret = tokens.secretSync();
  }
  //WARN: Generate a token to be sent to the client
  res.locals.csrfToken = tokens.create(req.session.csrfSecret);

  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then((result) => {
    app.listen(process.env.PORT, () =>
      console.log(`Server is listening on ${process.env.PORT}`),
    );
  })
  .catch((err) => console.log(err));
