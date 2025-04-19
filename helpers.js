//***HELPER***// This function helps look up user in the users object, using email
const getUserByEmail = (email, usersDatabase) => {
  for (const userId in usersDatabase) {
    const user = usersDatabase[userId];    // Get each user object
    if (user.email === email)        // If emails match, return the user
      return user;
  }
  return undefined;  // Return undefined if no user is found
};

module.exports = { getUserByEmail }