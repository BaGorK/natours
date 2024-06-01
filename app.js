import express from "express";
import morgan from "morgan";

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/api/v1/test", (req, res) => {
  return res
    .status(200)
    .json({ message: "Hello from the server side", app: "Natours" });
});

export default app;
