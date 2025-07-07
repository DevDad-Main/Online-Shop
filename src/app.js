import express from "express";
import { join } from "path";
import { urlencoded } from "body-parser";
import adminRoutes from "./routes/admin";
import shopRoutes from "./routes/shop";
import { get404 } from "./controllers/error";
import { mongoConnect } from "./util/database";
import User, { findById } from "./models/user";

const app = express();
const PORT = 3000;
const rootPath = join(__dirname, "public");

app.set("view engine", "ejs");
//WARN: cwd, current working directory + the /views/ folder
//WARN: As i have changed he project structure we have to specify the src/views no so we can still render our static views
app.set("views", "src/views");

app.use(urlencoded({ extended: false }));
app.use(express.static(rootPath));

app.use((req, res, next) => {
  findById("6867d9ea21f33fffdcc32e84")
    .then((user) => {
      // Assigning req.user to a newely instantiated object allowing us to access the methods of User.
      // Now we can call methods on req.user
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

// This will automatically consider our routes in the admin.js file.
// When filing the request through the middlewares
// Filtering our route via the /admin, so now the url has to go to /admin/add-product
app.use("/admin", adminRoutes);
app.use(shopRoutes);

// This will be a catch all route, because if our middlewares above
// Have nowhere else to go then we will send a 404 status code

// Then because we are using the use route and no path as the first parameter
// This will handle all http methods and not just ehg et or post
app.use(get404);

// app.listen(PORT);

mongoConnect(() => {
  app.listen(PORT);
});
