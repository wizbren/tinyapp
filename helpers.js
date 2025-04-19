//***HELPER***// This function helps look up user in the users object, using email
const getUserByEmail = (email, usersDatabase) => {
  for (const userId in usersDatabase) {
    const user = usersDatabase[userId];    // Get each user object
    if (user.email === email)        // If emails match, return the user
      return user;
  }
  return undefined;  // Return undefined if no user is found
};

//***HELPER***// This function returns only the URLs for a particular user
const urlsForUser = function(id) {
  const userURLs = {};                      // Empty object to store filtered URLs
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {   // Compare userID of URL to logged-in user
      userURLs[url] = urlDatabase[url];     // Add the URL to logged-in user's object
    }
  }
  return userURLs;       // Returns filtered user URLs
};

module.exports = { getUserByEmail, urlsForUser }