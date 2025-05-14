const express = require('express');
const _ = require('lodash');
const app = express();
const port = 3000;

app.get('/hello', (req, res) => {
  res.status(200).send('Hello SonarQube!');
});

// 🚨 Vulnerable deep merge of user input
app.get('/vuln', (req, res) => {
  try {
    const input = JSON.parse(req.query.input || '{}');
    const result = _.merge({}, input);
    res.json(result);
  } catch (e) {
    res.status(400).send('Invalid input');
  }
});

// 🚨 XSS risk: unsanitized input in HTML response
app.get('/xss', (req, res) => {
  const name = req.query.name || 'world';
  res.send(`<h1>Hello ${name}</h1>`);
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
  });
}

module.exports = app;
