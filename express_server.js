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
};                                                   // substring(2, 8) clips index 2 through 8, cutting out the 0.

// *** HELPER FUNCTION *** // This function helps look up user in the users object, using email
const getUserByEmail = (email, usersDatabase) => {
  for (const userId in usersDatabase) {
    const user = usersDB[userId];    // Get each user object
    if (user.email === email)        // If emails match, return the user
      return user;
  }
  return null;                       // Return null if there is no match 
};

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

app.get("/urls", (req, res) => {          // Page with list of shortURLs
  const userId = req.cookies.user_id;     // Get user ID from cookie
  const user = users[userId];             // Checks for user in users object
  const templateVars = { urls: urlDatabase, user }; // Pass user to template
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {     // Page for creating shortURLs
  const userId = req.cookies.user_id;    // Get user ID from cookie
  const user = users[userId];            // Checks for user in users object
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;                   // Get shortURL ID from route
  const longURL = urlDatabase[id];            // Get corresponding longURL
  const userId = req.cookies.user_id;         // Get user ID from cookie
  const user = users[userId];                 // Lookup user in users object
  const templateVars = { id, longURL, user }; // Pass user data to template
  res.render("urls_show", templateVars);             
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

app.get('/register', (req, res) => {
  const userId = req.cookies.user_id;  // Get user ID from cookie
  const user = users[userId];          // Check for user in users object
  const templateVars = { user };       // Pass user data to template
  res.render('register', templateVars);             
});

app.get("/login", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];          // Gets user id 
  const templateVars = { user };       // Pass user to template
  res.render("login", templateVars);   // Render login page
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
  const newLongURL = req.body.longURL;   // Gets new longURL from form(?)
  urlDatabase[id] = newLongURL;          // Updates database
  res.redirect("/urls");                 // Redirects user to main page
});

app.post("/login", (req, res) => {      
  const email = req.body.email;               // Get email from login form
  const password = req.body.password;         // Get password from login form
  const user = getUserByEmail(email, users);  // Uses function to look up user email

  if (!user) {
    res.statusCode = 403;              // Status code 403 = Forbidden
    return res.send("Email not found");
  }
  if (user.password !== password) {
    res.statusCode = 403;              // Status code 403 = Forbidden
    return res.send("Wrong password");
  }
  res.cookie("user_id", user.id);      // Sets up cookie with user ID
  res.redirect("/urls");               // Redirects to main page
});

app.post("/logout", (req, res) => {     
  res.clearCookie("user_id");           // Clears user_id cookie, logging user out
  res.redirect("/login");                // Redirects user to /login page
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;  // Gets email/password from form

  if (!email || !password) {             // Check #1: If there is no email or password
    return res.status(400).send("Email and password cannot be empty"); // Throw 400 error with message
  }

  for (const userId in users) {          // Loops through all user IDs in user object
    const user = users[userId];          // Retrieve user objects using userID
    if (user.email === email) {          // Check to make sure user email is not already taken
      return res.status(400).send("Email already registered."); // If taken, throw a 400 status with message
    }
  }

  const id = generateRandomString();     // Generate unique ID for new user
  const newUser = {                      // newUser object (obviously)
    id,
    email,
    password
  };
  
  users[id] = newUser;             // New user added to newUser object
  res.cookie("user_id", id);       // Sets cookie with new user's ID
//  console.log("Updated users:", users);  // Test to make sure user is being logged, commenting out until needed*
  res.redirect("/urls");           // Redirects to main page
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});