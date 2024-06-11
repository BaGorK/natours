import express from "express";
import morgan from "morgan";

import userRouter from "./routes/userRoutes.js";
import tourRouter from "./routes/tourRoutes.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.static(path.resolve(__dirname, `/public`)));

app.get("/api/v1/test", (req, res) => {
  return res
    .status(200)
    .json({ message: "Hello from the server side", app: "Natours" });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tours", tourRouter);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  })
})

export default app;
