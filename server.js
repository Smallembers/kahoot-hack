const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Load valid codes from the codes.json file
const VALID_CODES = JSON.parse(fs.readFileSync("codes.json", "utf8"));

app.use(cookieParser());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Track used codes with expiration time
let usedCodes = {};

// Check for expired codes and clean up
function cleanExpiredCodes() {
  const now = Date.now();
  for (const code in usedCodes) {
    if (usedCodes[code] < now) {
      delete usedCodes[code];
    }
  }
}

// Middleware to clean up expired codes every minute
setInterval(cleanExpiredCodes, 60000);

// Handle code input
app.post("/", (req, res) => {
  const code = req.body.code;

  // Validate the code
  if (!VALID_CODES.includes(code)) {
    return res.status(400).send("<h1>Invalid Code</h1>");
  }

  // Check if the code has already been used or expired
  const expirationTime = usedCodes[code];
  if (expirationTime && expirationTime > Date.now()) {
    return res.status(400).send("<h1>This code has already been used or expired.</h1>");
  }

  // Mark the code as used and set expiration time (1 hour from now)
  usedCodes[code] = Date.now() + 60 * 60 * 1000;  // Expire in 1 hour

  // Set the user session and send the page with the Kahoot embed
  res.cookie("codeEntered", true, { maxAge: 60 * 60 * 1000 }); // Set cookie for 1 hour
  res.redirect("/");
});

app.get("/", (req, res) => {
  const codeEntered = req.cookies.codeEntered;

  // Send the page that either shows the code input form or the Kahoot embed based on the cookie
  if (codeEntered) {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    return res.sendFile(path.join(__dirname, "public", "codeInput.html"));
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
