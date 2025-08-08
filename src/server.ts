import express from "express";
import "reflect-metadata";
import { router } from "./router";
import session from "express-session";

const app = express();
app.use(express.json());
app.use(
  session({
    secret: "a8d51d1d6fe5ea8d6e590e8dd2da426d",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.urlencoded({ extended: true }));

app.use("/", router(app));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
