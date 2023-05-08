const express = require('express');
const app = express();
const port = 3000;

const users = [
  { username: 'user1', password: 'pass1' },
  { username: 'user2', password: 'pass2' },
  { username: 'user3', password: 'pass3' },
];

const booksSet = new Set();
const booksMap = new Map();

// Middleware to handle Basic Authentication
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const encodedCredentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('ascii');
    const [username, password] = decodedCredentials.split(':');
    const user = users.find((u) => u.username === username && u.password === password);
    if (user) {
      req.user = user;
      next();
    } else {
      res.status(401).send('Invalid username or password');
    }
  } else {
    res.status(401).send('Authorization header not found');
  }
};

// Add books endpoint
app.post('/api/add-books', (req, res) => {
  const books = req.body.books;
  for (let book of books) {
    booksSet.add(book.title);
    booksMap.set(book.title, book);
  }
  res.send(`Added ${books.length} books to the set and map.`);
});

// Purchase book endpoint
app.post('/api/purchase-book', authenticateUser, (req, res) => {
  const book = req.body.book;
  const discountPercentage = req.body.discountPercentage;
  const taxPercentage = req.body.taxPercentage;
  const stock = req.body.stock;
  const amount = req.body.amount;
  const term = req.body.term;

  if (stock < amount) {
    res.status(400).send(`Sorry, we only have ${stock} copies of "${book.title}" by ${book.author} in stock.`);
    return;
  }

  let totalPrice = 0;
  let remainingStock = stock;

  for (let i = 1; i <= amount; i++) {
    if (remainingStock < 1) {
      res.status(400).send(`Sorry, "${book.title}" by ${book.author} is out of stock.`);
      return;
    }
    app.post('/api/purchase-book', authenticateUser, (req, res) => {
        const book = req.body.book;
        const discountPercentage = req.body.discountPercentage;
        const taxPercentage = req.body.taxPercentage;
        const stock = req.body.stock;
        const amount = req.body.amount;
        const term = req.body.term;
      
        // Add book to Set
        booksSet.add(book);
      
        // Add book to Map
        if (booksMap.has(book.title)) {
          booksMap.get(book.title).push(book);
        } else {
          booksMap.set(book.title, [book]);
        }
      
        if (stock < amount) {
          res.status(400).send(`Sorry, we only have ${stock} copies of "${book.title}" by ${book.author} in stock.`);
          return;
        }
      
        let totalPrice = 0;
        let remainingStock = stock;
      
        for (let i = 1; i <= amount; i++) {
          if (remainingStock < 1) {
            res.status(400).send(`Sorry, "${book.title}" by ${book.author} is out of stock.`);
            return;
          }
      
          // Calculate the amount of discount
          const discount = book.price * (discountPercentage / 100);
      
          // Calculate the price after discount
          const priceAfterDiscount = book.price - discount;
      
          // Calculate the amount of tax
          const tax = priceAfterDiscount * (taxPercentage / 100);
      
          // Calculate the price after tax
          const priceAfterTax = priceAfterDiscount + tax;
      
          totalPrice += priceAfterTax;
          remainingStock--;
        }
      
        const pricePerTerm = totalPrice / term;
      
        const creditDueEveryMonth = Array.from({ length: term }, (_, i) => {
          const month = i + 1;
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + month);
          return { month, dueDate, amount: pricePerTerm.toFixed(2) };
        });
      
        const response = {
          message: `You have purchased ${amount} copy/copies of "${book.title}" by ${book.author}.`,
          totalPrice: totalPrice.toFixed(2),
          creditDueEveryMonth,
          booksSet: Array.from(booksSet),
          booksMap: Object.fromEntries(booksMap),
        };
      
        if (remainingStock > 0) {
          response.stockMessage = `There are ${remainingStock} copy/copies of "${book.title}" by ${book.author} left in stock.`;
        } else {
          response.stockMessage = `"${book.title}" by ${book.author} is out of stock.`;
        }
      
        res.send(response);
    
    };
