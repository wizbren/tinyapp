const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());   // Middleware for reading/writing cookies

const PORT = 8080;             // default port 8080
app.set("view engine", "ejs"); // EJS renders HTML templates

app.use(express.urlencoded({ extended: true }));  // Middleware for reading forms

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
    },
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
    const user = usersDatabase[userId];    // Get each user object
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

  if (!user) {                           // Checks if user is (not) logged in
    return res.redirect("/login");       // Redirects to login form
  }
                                         // If logged in
  const templateVars = { user };         // Passes user info to template
  res.render("urls_new", templateVars);  // Renders urls/new page
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;                   // Get shortURL ID from route
  const urlData = urlDatabase[id];            // Get corresponding longURL
  const userId = req.cookies.user_id;         // Get user ID from cookie
  const user = users[userId];                 // Lookup user in users object

  if (!urlData) {                             // If no shortURL is found
    return res.status(404).send("Short URL not found"); // Send 404 message
  }

  const templateVars = { id, longURL: urlData.longURL, user }; //**Updated to access nested value
  res.render("urls_show", templateVars);      // Render details of the shortURL
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;           // Gets shortURL id
  const urlData = urlDatabase[id];    // Checks longURL in database

  if (!urlData) {                     // Checks for existence of shortURL
    return res.status(404).send("404 Not Found: This short URL doesn't exist.");
  }
  res.redirect(urlData.longURL);      //**Redirects to correct longURL
});

app.get('/register', (req, res) => {
  const userId = req.cookies.user_id;  // Get user ID from cookie
  const user = users[userId];          // Check for user in users database

  if (user) {
    return res.redirect("/urls");
  }
                                        // If user isn't logged in, redirect to registration form
  const templateVars = { user: null };  // Sets user to null (not logged in)
  res.render('register', templateVars); // Render registration form            
});

app.get("/login", (req, res) => {
  const userId = req.cookies.user_id;  // Gets user ID from cookie
  const user = users[userId];          // Looks user up in users database

  if (user) {                          // If matched, confirms user is logged in
    return res.redirect("/urls");      // Redirect logged-in users to main
  }
                                       // If user isn't logged in, redirect to login form
  const templateVars = { user: null }; // Sets user to null (not logged in)
  res.render("login", templateVars);   // Render login form
});

// ============POST=============

app.post("/urls", (req, res) => {
  const userId = req.cookies.user_id; // Gets user ID from cookie
  const user = users[userId];         // Looks user up in users database

  if (!user) {                       // Checks if user is (not) logged in
    return res.status(401).send("You must be logged in."); // If not, sends status code and message
  }

  const longURL = req.body.longURL;  // Gets longURL from form
  const id = generateRandomString(); // Generates shortURL ID
  urlDatabase[id] = { longURL, userID: userId}; // Store new URL as object, then link to user       
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

  if (urlDatabase[id]) {
    urlDatabase[id].longURL = newLongURL; //**Updates the nested longURL
  }
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