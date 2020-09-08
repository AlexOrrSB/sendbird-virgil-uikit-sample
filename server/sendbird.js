const express = require('express');
const fetch = require('node-fetch');

const appId = process.env.SENDBIRD_APP_ID;
const apiToken = process.env.SENDBIRD_API_TOKEN;
const sendbirdBaseUrl = `https://api-${appId}.sendbird.com`;
const headers = {
  'Content-Type': 'Aaplication/json',
  'Api-Token': apiToken,
};

const sendbirdRouter = express.Router();

const getUser = async (userId) => {
  const response = await fetch(`${sendbirdBaseUrl}/v3/users/${userId}`, {
    headers,
  });
  return await response.json();
};

const createUser = async (userId, nickname) => {
  const response = await fetch(`${sendbirdBaseUrl}/v3/users`, {
    method: 'POST',
    headers,
    body: {
      user_id: userId,
      nickname,
      profile_url: '',
      issue_access_token: true,
    },
  });

  return await response.json();
};

sendbirdRouter.get('/accessToken/:userId', async (req, res) => {
  try {
    const { params } = req;
    const { userId } = params;

    const user = await getUser(userId);
    const accessToken = user.access_token;
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = { sendbirdRouter, createUser, getUser };
