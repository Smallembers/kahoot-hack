const express = require("express");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Load valid codes from JSON
const VALID_CODES = JSON.parse(fs.readFileSync("codes.json", "utf8"));

// Load used code data
function loadUsersData() {
  try {
    return JSON.parse(fs.readFileSync("users.js", "utf8"));
  } catch {
    return {};
  }
}

function saveUsersData(data) {
  fs.writeFileSync("users.js", JSON.stringify(data, null, 2), "utf8");
}

let usedCodes = loadUsersData();

function cleanExpiredCodes() {
  const now = Date.now();
  for (const code in usedCodes) {
    if (usedCodes[code] < now) {
      delete usedCodes[code];
    }
  }
  saveUsersData(usedCodes); // Keep file clean too
}

setInterval(cleanExpiredCodes, 60000);

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// POST code entry
app.post("/", (req, res) => {
  const code = req.body.code?.trim();

  if (!code) {
    return res.status(400).send(`<script>alert("Please enter a code."); window.location.href="/";</script>`);
  }

  if (code === "goobers") {
    // Just load the main page, no cookie
    return res.sendFile(path.join(__dirname, "public", "index.html"));
  }

  if (!VALID_CODES.includes(code)) {
    return res.status(400).send(`<script>alert("Invalid code."); window.location.href="/";</script>`);
  }

  const now = Date.now();
  if (usedCodes[code] && usedCodes[code] > now) {
    return res.status(400).send(`<script>alert("Code already used."); window.location.href="/";</script>`);
  }

  // Save code use for 1 hour
  usedCodes[code] = now + 60 * 60 * 1000;
  saveUsersData(usedCodes);

  // Set cookie for 1 hour
  res.cookie("codeEntered", true, { maxAge: 60 * 60 * 1000 });
  res.redirect("/");
});

// GET main page
app.get("/", (req, res) => {
  if (req.cookies.codeEntered) {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
  } else {
    return res.sendFile(path.join(__dirname, "public", "index.html")); // includes code input logic
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
