const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

// ============GET=============

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;           // Gets ID from route
  const longURL = urlDatabase[id];    // Checks database for the URL
  
  const templateVars = { id: id, longURL: longURL};  // Defines longURL object
  res.render("urls_show", templateVars);             // Render values
});

// ============POST=============

app.post("/urls", (req, res) => {
  console.log(req.body);       // POST request logs to console
  res.send("Did it work?");    // Response
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});