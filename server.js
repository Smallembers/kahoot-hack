const express = require("express");
const fs = require("fs");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;
const CODES_FILE = "./codes.json";

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Load codes from codes.json
function loadCodes() {
  if (!fs.existsSync(CODES_FILE)) fs.writeFileSync(CODES_FILE, "[]");
  return new Set(JSON.parse(fs.readFileSync(CODES_FILE)));
}

// Save codes to codes.json
function saveCodes(codes) {
  fs.writeFileSync(CODES_FILE, JSON.stringify(Array.from(codes)));
}

// Home route — shows code input unless already logged in
app.get("/", (req, res) => {
  if (req.cookies.access === "granted") {
    return res.redirect("/kahoot");
  }
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Handle submitted code
app.post("/submit", (req, res) => {
  const code = req.body.code;
  const codes = loadCodes();

  if (code === "goobers") {
    res.cookie("access", "granted", { maxAge: 1000 * 60 * 60 }); // 1 hour
    return res.redirect("/kahoot");
  }

  if (codes.has(code)) {
    codes.delete(code); // remove used code
    saveCodes(codes);
    res.cookie("access", "granted", { maxAge: 1000 * 60 * 60 }); // 1 hour
    return res.redirect("/kahoot");
  }

  res.send("<h2>❌ Invalid or used code</h2><a href='/'>Try again</a>");
});

// Protected Kahoot embed route
app.get("/kahoot", (req, res) => {
  if (req.cookies.access === "granted") {
    res.send(`
      <style>
        body, html { margin:0; height:100%; overflow:hidden; }
        iframe { width:100%; height:100%; border:none; }
      </style>
      <iframe src="https://kahoot.club" allowfullscreen></iframe>
    `);
  } else {
    res.redirect("/");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
