const express = require("express");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = './users.json';
const VALID_CODES = [
  "4938712", "2849673", "1938472", "8571934", "7102948",
  "6591732", "9845617", "1283476", "2349851", "8374629",
  "6758392", "9157283", "2483791", "3209485", "7851293",
  "5381726", "1827364", "9471836", "1837642", "6284731",
  "3019847", "4982735", "8745123", "7382914", "1649372",
  "9102834", "5938274", "3817462", "6201938", "9483721",
  "7428913", "5198372", "8237619", "3649182", "7854129",
  "2183647", "9738126", "6832917", "4592837", "2374619",
  "9842713", "3749182", "2083746", "6138742", "1938475",
  "4829371", "5892736", "6482719", "3048712", "7192834",
  "1634872", "9283741", "2847361", "8791324", "4509872",
  "6357281", "3218472", "7832941", "1238947", "1948372",
  "2783491", "9871342", "7452813", "6182374", "3428916",
  "9034728", "7482913", "5219374", "6328491", "2983714",
  "7421389", "3829471", "6182734", "9841372", "4319284",
  "1283947", "6723814", "8491732", "9032817", "4298713",
  "8753291", "7438192", "1849372", "5648391", "2398471",
  "6184729", "9347182", "4182736", "8794213", "2304987",
  "9472138", "7893412", "6219834", "3984712", "5204837",
  "8942137", "2358719", "6192837", "7839214", "9823417"
];

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

  // Set the user session and redirect to Kahoot embed
  res.cookie("codeEntered", true, { maxAge: 60 * 60 * 1000 }); // Set cookie for 1 hour
  res.redirect("/");
});

app.get("/", (req, res) => {
  const codeEntered = req.cookies.codeEntered;
  if (codeEntered) {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    return res.sendFile(path.join(__dirname, "public", "codeInput.html"));
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
