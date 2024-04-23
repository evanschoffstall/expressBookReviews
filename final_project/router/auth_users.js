const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// check if user is valid
const isValid = (username)=>{ 
  let usersWithSameName = users.filter((user)=>{
    return user.username === username
  });
  if(usersWithSameName.length > 0){
    return true;
  } else {
    return false;
  }
}

// check if user could be authenticated
const authenticatedUser = (username,password)=>{ 
  let validUsers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validUsers.length > 0){
    return true;
  } else {
    return false;
  }
}

// only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
 if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }});

// Add a book review given the following parameters:
// You have to give a review as a request query & it must get posted with the username (stored in the session) posted. 
// If the same user posts a different review on the same ISBN, it should modify the existing review. 
// If another user logs in and posts a review on the same ISBN, it will get added as a different review under the same ISBN.
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (isbn && review && username) {
    if (books[isbn]) {
      // Initialize reviews as an object if it's not already one
      if (typeof books[isbn].reviews !== 'object') {
        books[isbn].reviews = {};
      }
      
      if (username in books[isbn].reviews) {
        books[isbn].reviews[username] = review;
        return res.status(200).json({message: "Review updated successfully"});
      } else {
        books[isbn].reviews[username] = review;
        return res.status(200).json({message: "Review added successfully"});
      }
    } else {
      return res.status(404).json({message: "Book not found"});
    }
  }
  return res.status(404).json({message: "Unable to add/update review"});
});

// Delete a book review given the ISBN of the book given the following parameters:
// Filter & delete the reviews based on the session username, so that a user can delete only his/her reviews and not other users
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (isbn && username) {
    if (books[isbn]) {
      if (username in books[isbn].reviews) {
        delete books[isbn].reviews[username];
        return res.status(200).json({message: "Review deleted successfully"});
      } else {
        return res.status(404).json({message: "Review not found"});
      }
    } else {
      return res.status(404).json({message: "Book not found"});
    }
  }
  return res.status(404).json({message: "Unable to delete review"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
