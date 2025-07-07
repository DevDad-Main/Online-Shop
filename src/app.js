const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();
const PORT = 3000;
const rootPath = path.join(__dirname, "public");

app.set("view engine", "ejs");
//WARN: cwd, current working directory + the /views/ folder
//WARN: As i have changed he project structure we have to specify the src/views no so we can still render our static views
app.set("views", "src/views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(rootPath));

// app.use((req, res, next) => {
//   User.findById("6867d9ea21f33fffdcc32e84")
//     .then((user) => {
//       // Assigning req.user to a newely instantiated object allowing us to access the methods of User.
//       // Now we can call methods on req.user
//       req.user = new User(user.name, user.email, user.cart, user._id);
//       next();
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

// This will automatically consider our routes in the admin.js file.
// When filing the request through the middlewares
// Filtering our route via the /admin, so now the url has to go to /admin/add-product
app.use("/admin", adminRoutes);
app.use(shopRoutes);

// This will be a catch all route, because if our middlewares above
// Have nowhere else to go then we will send a 404 status code

// Then because we are using the use route and no path as the first parameter
// This will handle all http methods and not just ehg et or post
app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://devdad:Martametz311219!@cluster1.6zhu8cq.mongodb.net/shop",
  )
  .then((result) =>
    app.listen(PORT, () => console.log(`Server is listening on ${PORT}`)),
  )
  .catch((err) => console.log(err));
