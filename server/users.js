const express = require('express');
const fetch = require('node-fetch');
const { createUser } = require('./sendbird');

const usersRouter = express.Router();
usersRouter.post('/', async (req, res) => {
  try {
    const { body } = req;
    const { userId, nickname } = body;

    const sendbirdUser = await createUser(userId, nickname);
    const responseJson = await sendbirdUser.json();
    const accessToken = responseJson.access_token;
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = { usersRouter };
