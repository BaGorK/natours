import * as dotenv from "dotenv";
dotenv.config();


import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`App running on port ${PORT}...`));
