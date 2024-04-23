const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  let theseBooks = new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch (err) {
      reject(err);
    }
  });

  theseBooks.then(
    (data) => res.status(200).json({ books: data }),
    (err) => res.status(500).json({ error: err })
  );
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  let getBookByISBN = new Promise((resolve, reject) => {
    try {
      resolve(books[req.params.isbn]);
    } catch (err) {
      reject(err);
    }
  });

  getBookByISBN.then(
    (data) => res.status(200).json(data),
    (err) => res.status(500).json({ error: err })
  );
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  let getBooksByAuthor = new Promise((resolve, reject) => {
    try {
      let booksByAuthor = [];
      for (let book in books) {
        if (books[book].author.toLowerCase() === req.params.author.toLowerCase()) {
          booksByAuthor.push(books[book]);
        }
      }
      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);
      } else {
        throw new Error("No books found for this author");
      }
    } catch (err) {
      reject(err);
    }
  });

  getBooksByAuthor.then(
    (data) => res.status(200).json(data),
    (err) => res.status(404).json({ message: err.message })
  );
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  let getBooksByTitle = new Promise((resolve, reject) => {
    try {
      let booksByTitle = [];
      for (let book in books) {
        if (books[book].title.toLowerCase() === req.params.title.toLowerCase()) {
          booksByTitle.push(books[book]);
        }
      }
      if (booksByTitle.length > 0) {
        resolve(booksByTitle);
      } else {
        throw new Error("No books found with this title");
      }
    } catch (err) {
      reject(err);
    }
  });

  getBooksByTitle.then(
    (data) => res.status(200).json(data),
    (err) => res.status(404).json({ message: err.message })
  );
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  return res.status(200).json(books[req.params.isbn].reviews);
});

module.exports.general = public_users;
