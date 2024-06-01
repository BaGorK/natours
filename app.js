import express from "express";
import morgan from "morgan";

import userRouter from "./routes/userRoutes.js";

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/api/v1/test", (req, res) => {
  return res
    .status(200)
    .json({ message: "Hello from the server side", app: "Natours" });
});

app.use("/api/v1/users", userRouter);

export default app;
