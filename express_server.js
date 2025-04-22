const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');
const bcrypt = require("bcryptjs");
const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['your-secret-key-here'],
}));

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
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10),
  },
};

// ============GET=============

app.get("/", (req, res) => {
  const userId = req.session.user_id;

  if (userId && users[userId]) {
    return res.redirect("/urls");   // If user is logged in, redirect to /urls
  }
  res.redirect("/login");           // If not logged in, redirect to /login
});

app.get("/urls.json", (req, res) => {  // Responds with database in JSON
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {          // Page with list of shortURLs
  const userId = req.session.user_id;     // Get user ID from cookie
  const user = users[userId];             // Checks user with userId from cookie

  if (!user) {                            // If no user is logged in
    return res.status(401).send("Must be logged in to view your URLs."); // Show error
  }
  
  const userURLs = urlsForUser(userId, urlDatabase);   // Helper function gets only the URLs for logged-in user
  const templateVars = { urls: userURLs, user: users[userId] }; // Pass logged-in user info to template
  res.render("urls_index", templateVars); // Render URLs page with user's data
});

app.get("/urls/new", (req, res) => {     // Page for creating shortURLs
  const userId = req.session.user_id;    // Get user ID from cookie
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
  const userId = req.session.user_id;         // Get user ID from cookie
  const user = users[userId];                 // Lookup user in users object

  if (!userId) {                         // Checks to see if user is logged in
    return res.status(401).send("Must be logged in."); // Shows error if not
  }

  if (!urlData) {                             // If no shortURL is found
    return res.status(404).send("Short URL not found"); // Send 404 message
  }

  if (urlData.userID !== userId) {        // Checks to see if URL belongs to logged-in user
    return res.status(403).send("You don't have permission to view this URL.")
  }

  const templateVars = { id, longURL: urlData.longURL, user }; //**Updated to access nested value
  res.render("urls_show", templateVars);;   // Renders page for specific URL
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;           // Gets shortURL id
  const urlData = urlDatabase[id];    // Checks longURL in database

  if (!urlData) {                     // Checks for existence of shortURL
    return res.status(404).send("404 Not Found: This short URL doesn't exist.");
  }
  res.render("urls_show", templateVars);      //**Redirects to correct longURL
});

app.get('/register', (req, res) => {
  const userId = req.session.user_id;  // Get user ID from cookie
  const user = users[userId];          // Check for user in users database

  if (user) {
    return res.redirect("/urls");
  }
                                        // If user isn't logged in, redirect to registration form
  const templateVars = { user: null };  // Sets user to null (not logged in)
  res.render('register', templateVars); // Render registration form            
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;  // Gets user ID from cookie
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
  const userId = req.session.user_id; // Gets user ID from cookie
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
  const id = req.params.id;             // Gets shortURL id
  const userId = req.session.user_id;   // Get logged-in user ID from cookie
  const urlData = urlDatabase[id];      // Get URL object from database

  if (!urlData) {        // If URL doesn't exist, send error message
    return res.status(404).send("Error: URL not found.");
  }

  if (!userId) {         // If user isn't logged in, send error message
    return res.status(401).send("Error: You must be logged in.");
  }

  if (urlData.userID !== userId) {      // If URL doesn't belong to user, send error message
    return res.status(403).send("Error: You do not have permission.");
  }

  delete urlDatabase[id];               // DELETE the id from database
  res.redirect("/urls");                // Redirects user back to main page
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;              // Gets shortURL from id
  const userId = req.session.user_id;    // Get logged-in user's ID from cookie
  const urlData = urlDatabase[id];       // Get URL object from database

  if (!urlData) {            // If URL doesn't exist, send error message
    res.status(404).send("Error: URL not found."); 
  }

  if (!userId) {             // If user isn't logged in, send error message                     
    return res.status(401).send("Error: You must be logged in.")
  }

  if (urlData.userID !== userId) {    // If URL doesn't match with user ID, send permission error
    return res.status(403).send("Error: You do not have permission.")
  }
  
  const newLongURL = req.body.longURL;   // Get updated longURL from form
  urlDatabase[id].longURL = newLongURL;  // Updates longURL in database
  res.redirect("/urls");                 // Redirects user to main page
});

app.post("/login", (req, res) => {      
  const email = req.body.email;               // Get email from login form
  const password = req.body.password;         // Get password from login form
  const user = getUserByEmail(email, users);  // Uses function to look up user email

  if (!user) {                          // If user ID doesn't match with existing in database            
    return res.status(403).send("Email not found"); // Send user error message
  }
                                        
  if (!bcrypt.compareSync(password, user.password)) { // Checks if entered password matches                    
    return res.status(403).send("Wrong password");    // a stored hashed password            
  }

  req.session.user_id = user.id;      
  res.redirect("/urls");               // Redirects to main page
});

app.post("/logout", (req, res) => {     
  req.session = null;                   
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
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {                      // newUser object (obviously)
    id,
    email,
    password: hashedPassword
  };
  
  users[id] = newUser;             // New user added to newUser object
  req.session.user_id = id;       // Sets cookie with new user's ID

  res.redirect("/urls");           // Redirects to main page
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});