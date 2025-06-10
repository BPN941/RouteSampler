const express = require("express");
const fs = require("fs");
const path = require("path");
const { config } = require("dotenv");

config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = 3000;
const API_KEY = process.env.API_KEY;

app.get("/", (req, res) => {
  const htmlPath = path.join(__dirname, "index.html");
  let htmlContent = fs.readFileSync(htmlPath, "utf-8");
  htmlContent = htmlContent.replace("API_KEY", API_KEY); // Ensure placeholder matches
  res.send(htmlContent);
});

app.use(express.static(__dirname)); // Serve static files like CSS, JS, etc.

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
