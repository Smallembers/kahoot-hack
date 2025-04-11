const express = require("express");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const VALID_CODES = JSON.parse(fs.readFileSync("codes.json", "utf8"));

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

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

let usedCodes = loadUsersData();

function cleanExpiredCodes() {
  const now = Date.now();
  for (const code in usedCodes) {
    if (usedCodes[code] < now) delete usedCodes[code];
  }
}
setInterval(cleanExpiredCodes, 60000);

app.post("/", (req, res) => {
  const code = req.body.code;
  const now = Date.now();

  if (code === "goobers") {
    res.cookie("codeUsed", "goobers");
    return res.redirect("/menu.html");
  }

  if (!VALID_CODES.includes(code)) {
    return res.status(400).send("<h1>Invalid Code</h1>");
  }

  // Start timer on first use
  if (!usedCodes[code]) {
    usedCodes[code] = now + 60 * 60 * 1000;
    saveUsersData(usedCodes);
  }

  // Code expired
  if (usedCodes[code] < now) {
    return res.status(400).send("<h1>This code has already been used or expired.</h1>");
  }

  // Still valid
  res.cookie("codeUsed", code);
  res.redirect("/menu.html");
});

app.get("/menu.html", (req, res, next) => {
  const code = req.cookies.codeUsed;

  if (!code) return res.redirect("/");

  if (code === "goobers") {
    const menuPath = path.join(__dirname, "public", "menu.html");
    return fs.readFile(menuPath, "utf8", (err, html) => {
      if (err) return next(err);
      const injected = html.replace(
        "</head>",
        `<script>window.SERVER_TIME_LEFT = "infinite";</script>\n</head>`
      );
      res.send(injected);
    });
  }

  const expiration = usedCodes[code];
  const now = Date.now();

  if (!expiration || expiration < now) {
    return res.redirect("/");
  }

  const timeLeft = expiration - now;
  const menuPath = path.join(__dirname, "public", "menu.html");

  fs.readFile(menuPath, "utf8", (err, html) => {
    if (err) return next(err);
    const injected = html.replace(
      "</head>",
      `<script>window.SERVER_TIME_LEFT = ${timeLeft};</script>\n</head>`
    );
    res.send(injected);
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "codeInput.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
