const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());   // Middleware for reading/writing cookies

const PORT = 8080;             // default port 8080
app.set("view engine", "ejs"); // EJS renders HTML templates

app.use(express.urlencoded({ extended: true }));  // Middleware for reading forms

const urlDatabase = {      // Database storing short URLs and their longURLs counterparts
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function generateRandomString() {                    // Creates random 6-char string for shortURLs
  return Math.random().toString(36).substring(2, 8); // 36 comes from 26 letters of alphabet, and numbers 0-9
}                                                    // substring(2, 8) clips index 2 through 8, cutting out the 0.

// ============GET=============

app.get("/", (req, res) => {  // Root route
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {  // Responds with database in JSON
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {  // Just a 'hello' page (Not important)
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {   // Main page with list of shortURLs
  const templateVars = { urls: urlDatabase, username: req.cookies.username }; // Pass username to template
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {     // Page for creating shortURLs
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
  const id = req.params.id;           // Gets shortURL id
  const longURL = urlDatabase[id];    // Checks longURL in database

  if (longURL) {
    res.redirect(longURL);            // Redirects to correct page
  } else {
    res.status(404).send("Short URL not found."); // 404 error message
  }
});

app.get('/register', (req, res) => {  // Route to the register form page
  res.render('register');             // Renders register.ejs template for user on /register page
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

app.post("/login", (req, res) => {      
  const username = req.body.username;   // Gets username from login form
  res.cookie("username", username);     // Sets up username in cookie
  res.redirect("/urls");                // Redirects to urls page
});

app.post("/logout", (req, res) => {     
  res.clearCookie("username");          // Clears username cookie, logging user out
  res.redirect("/urls");                // Redirects user to /urls page
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});