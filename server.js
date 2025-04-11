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

  if (code === "goobers") {
    res.cookie("codeEntered", true);
    res.cookie("codeUsed", "goobers");
    return res.redirect("/");
  }

  if (!VALID_CODES.includes(code)) {
    return res.status(400).send("<h1>Invalid Code</h1>");
  }

  const expirationTime = usedCodes[code];
  if (expirationTime && expirationTime > Date.now()) {
    return res.status(400).send("<h1>This code has already been used or expired.</h1>");
  }

  usedCodes[code] = Date.now() + 60 * 60 * 1000;
  saveUsersData(usedCodes);

  res.cookie("codeEntered", true, { maxAge: 60 * 60 * 1000 });
  res.cookie("codeUsed", code, { maxAge: 60 * 60 * 1000 });
  res.redirect("/");
});

app.get("/", (req, res) => {
  const codeEntered = req.cookies.codeEntered;
  const codeUsed = req.cookies.codeUsed;

  if (codeEntered) {
    let timeLeft = null;

    if (codeUsed === "goobers") {
      timeLeft = "infinite";
    } else if (usedCodes[codeUsed]) {
      timeLeft = Math.max(0, usedCodes[codeUsed] - Date.now());
    }

    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Menu</title>
        <style>
          body { font-family: sans-serif; margin: 0; padding: 0; background: #282c34; color: white; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
          #menu { text-align: center; }
          #timer { position: fixed; top: 15px; right: 20px; font-size: 1.5rem; background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 8px; }
          iframe { display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; border: none; z-index: 999; }
        </style>
        <script>
          window.SERVER_TIME_LEFT = ${JSON.stringify(timeLeft)};
        </script>
        <script src="/menu.js" defer></script>
      </head>
      <body>
        <div id="timer">Loading...</div>
        <div id="menu">
          <h1>Access Granted</h1>
          <button onclick="openKahoot()">Open Kahoot</button>
        </div>
        <iframe id="kahootFrame" src="https://kahoot.club/"></iframe>
      </body>
      </html>
    `);
  }

  res.sendFile(path.join(__dirname, "public", "codeInput.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
