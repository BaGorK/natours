import express from "express";

const app = express();

app.get("/test", (req, res) => {
  res
    .status(200)
    .json({ message: "Hello from the server side", app: "Natours" });
});

export default app;
