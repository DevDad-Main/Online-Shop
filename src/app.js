const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const adminRoutes = require("./routes/admin.routes");
const shopRoutes = require("./routes/shop.routes");
const authRoutes = require("./routes/auth.routes");
const errRoutes = require("./routes/err.routes");
const User = require("./models/user.models");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const dotenv = require("dotenv");

dotenv.config();
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
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Olly",
          email: "Olly@test.com",
          cart: { items: [] },
        });
        user.save();
      }
    });

    app.listen(process.env.PORT, () =>
      console.log(`Server is listening on ${process.env.PORT}`),
    );
  })
  .catch((err) => console.log(err));
