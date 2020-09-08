require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { usersRouter } = require('./users');
const { virgilRouter } = require('./virgil');
const { sendbirdRouter } = require('./sendbird');

const app = express();
const port = 6789;

app.use(cors());

app.use('/users', usersRouter);
app.use('/virgil', virgilRouter);
app.use('/sendbird', sendbirdRouter);

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`),
);
