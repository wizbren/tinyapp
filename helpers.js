//***HELPER***//  Creates random 6-char string for shortURLs

function generateRandomString() {                    
  return Math.random().toString(36).substring(2, 8); // 36 comes from 26 letters of alphabet, and numbers 0-9
};                                                   // substring(2, 8) clips index 2 through 8, cutting out the 0.


//***HELPER***//  This function helps look up user in the users object, using email
const getUserByEmail = (email, usersDatabase) => {
  for (const userId in usersDatabase) {
    const user = usersDatabase[userId];              // Get each user object
    if (user.email === email)                        // If emails match, return the user
      return user;
  }
  return undefined;                                  // Return undefined if no user is found
};

//***HELPER***//  This function returns only the URLs for a particular user
const urlsForUser = function(id, urlDatabase) {
  const userURLs = {};                               // Empty object to store filtered URLs
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {            // Compare userID of URL to logged-in user
      userURLs[url] = urlDatabase[url];              // Add the URL to logged-in user's object
    }
  }
  return userURLs;                                   // Returns filtered user URLs
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString };