const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
  g2TrkP: { longURL: "https://www.bbc.com", userID: "userRandomID" }
};

describe('getUserByEmail', function() {
  it('should return a user object when given a valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    assert.isObject(user);
    assert.strictEqual(user.id, "userRandomID");
  });

  it('should return undefined when given an email not in the database', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.isUndefined(user);
  });

  it('should return undefined when given an empty email', function() {
    const user = getUserByEmail("", testUsers);
    assert.isUndefined(user);
  });
});

// Tests for urlsForUser
describe('urlsForUser', function() {
  it('should return the correct URLs for a valid user ID', function() {
    const urls = urlsForUser("userRandomID", urlDatabase);
    const expected = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
      g2TrkP: { longURL: "https://www.bbc.com", userID: "userRandomID" }
    };
    assert.deepEqual(urls, expected);
  });

  it('should return an empty object if the user has no URLs', function() {
    const urls = urlsForUser("nonexistentUser", urlDatabase);
    assert.deepEqual(urls, {});
  });

  it('should return an empty object for an empty database', function() {
    const urls = urlsForUser("userRandomID", {});
    assert.deepEqual(urls, {});
  });
});