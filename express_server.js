const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
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
  const templateVars = { urls: urlDatabase, username: req.cookies.username }; // Pass username to template
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies["username"];
  const templateVars = { username };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;           // Gets ID from route
  const longURL = urlDatabase[id];    // Checks database for the URL
  
  const templateVars = { id: id, longURL: longURL, username: req.cookies.username };  // Defines longURL object
  res.render("urls_show", templateVars);             // Render values
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;         // Gets shortURL id
  const longURL = urlDatabase[id];  // Checks longURL in database

  if (longURL) {
    res.redirect(longURL);          // Redirects to correct page
  } else {
    res.status(404).send("Short URL not found."); // 404 error message
  }
});

// ============POST=============

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;  // Gets longURL from form
  const id = generateRandomString(); // Creates shortURL id
  urlDatabase[id] = longURL;         // Saves both short and long to database...(?)
  
  res.redirect(`/urls/${id}`);       // Redirect to the shortURL page
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;          // Gets shortURL id
  delete urlDatabase[id];            // DELETE the id from database
  res.redirect("/urls");             // Redirects user back to main page
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;              // Gets shortURL from id
  const newLongURL = req.body.longURL; // Gets new longURL from form(?)
  urlDatabase[id] = newLongURL;          // Updates database

  res.redirect("/urls");                 // Redirects user to main page
});

app.post("/login", (req, res) => {      // Gets username from login form
  const username = req.body.username;   // Sets up username in cookie
  res.cookie("username", username);     // Redirects to urls page
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});