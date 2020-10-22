# End-to-End Encryption for Sendbird Chat

## Why use Virgil's E3Kit With Sendbird

According to Virgil's website:

> - **Full Security**: Full privacy: Only user can read their own messages; Sendbird, Virgil and other third-party services cannot decrypt and access messages and data.
> - **Complete end-to-end encryption**: User's data is always encrypted and protected - at rest and in transit.
> - **Independent data protection**: With E3Kit your data protection doesn't rely on any network and service providers, so any attacks on them won't influence the data integrity and confidentiality.
> - **Data integrity**: The E3Kit signs and verifies data as part of the encrypt and decrypt functions. This confirms that data is actually coming from the user who encrypted it and that it hasn't been tampered with in transit or storage.

<!-- TODO: Update links -->

## Examples

- [JavaScript](https://github.com/AlexOrrSB/sendbird-virgil-uikit-sample)

## Get Started

### Create a Sendbird Application

[Sign up](https://dashboard.sendbird.com/auth/signup) for a free Sendbird account and create a new chat application.

### Create a Virgil Account

[Sign up](https://dashboard.virgilsecurity.com/signup) for a free Virgil account and create a new applicaton.

## Setup your backend

### Configure your backend

Add your `SENDBIRD_APP_ID`, `SENDBIRD_API_TOKEN`, `VIRGIL_APP_ID`, `VIRGIL_APP_KEY`, `VIRGIL_APP_KEY_ID` to your .env file

### Set up an Express server

```
// server/index.js
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
```

### Provide users access to Sendbird and Virgil Cloud

Provide users a [Virgil JWT](https://developer.virgilsecurity.com/docs/e3kit/get-started/generate-client-tokens/) and [Sendbird access/session token](https://docs.sendbird.com/platform/user#3_create_a_user_4_access_token_vs_session_token) from your backend.

In a production application this request should require authentication.

```
// server/sendbird.js
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

module.exports = { sendbirdRouter, getUser };
```

```
// server/virgil.js
const express = require('express');
const { JwtGenerator } = require('virgil-sdk');
const {
  initCrypto,
  VirgilCrypto,
  VirgilAccessTokenSigner,
} = require('virgil-crypto');

const getJwtGenerator = async () => {
  await initCrypto();

  const virgilCrypto = new VirgilCrypto();

  return new JwtGenerator({
    appId: process.env.VIRGIL_APP_ID,
    apiKeyId: process.env.VIRGIL_APP_KEY_ID,
    apiKey: virgilCrypto.importPrivateKey(process.env.VIRGIL_APP_KEY),
    accessTokenSigner: new VirgilAccessTokenSigner(virgilCrypto),
  });
};

const generatorPromise = getJwtGenerator();

const virgilRouter = express.Router();

virgilRouter.get('/jwt/:userId', async (req, res) => {
  const { params } = req;
  const { userId } = params;
  const generator = await generatorPromise;
  const virgilJwtToken = generator.generateToken(userId);

  res.json({ virgilToken: virgilJwtToken.toString() });
});

module.exports = { virgilRouter };
```

## Setup your client application

### Get started with a Sendbird sample app

#### JavaScript

Start with [a Sendbird JavaScript sample app](https://github.com/sendbird/SendBird-JavaScript). We're going to use the [Sendbird JavaScript UIkit Custom Sample](https://github.com/sendbird/SendBird-JavaScript/tree/master/uikit-samples/custom-react-app) as a starting point. This gives us a start app with some custom components we can quickly modify.

#### iOS

Start with [a Sendbird iOS sample app](https://github.com/sendbird/SendBird-iOS)

#### Android

Start with [a Sendbird Android sample app](https://github.com/sendbird/SendBird-Anrdoid)

### Add Virgil's E3Kit to your client application

Follow the directions in the [Virgil documentation](https://developer.virgilsecurity.com/docs/e3kit/get-started/setup-client/#install-e3kit)

#### JavaScript

```
yarn add @virgilsecurity/e3kit-browser
```

or

```
npm install @virgilsecurity/e3kit-browser
```

### Initialize Virgil's E3Kit in your client application

Follow the steps in the [Virgil documentation](https://developer.virgilsecurity.com/docs/e3kit/get-started/setup-client/#initialize-e3kit)

#### JavaScript

For easy access we will create a hook for all the Virgil functionality

```
// javascript-sample/src/utils/e3.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { EThree } from '@virgilsecurity/e3kit-browser';

const e3Context = createContext();

export const E3Provider = ({ children }) => {
  const [e3, setE3] = useState();
  const [isInitialized, setIsInitialized] = useState(false);
  const [userId, setUserId] = useState();

  useEffect(() => {
    if (userId) {
      initE3(userId);
    }
  }, [userId]);

  const getVirgilToken = async (userId) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/virgil/jwt/${userId}`,
    );
    const responseJson = await response.json();
    const { virgilToken } = responseJson;
    return virgilToken;
  };

  const initE3 = async (userId) => {
    try {
      const e3 = await EThree.initialize(() => getVirgilToken(userId));
      setE3(e3);
      setIsInitialized(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <e3Context.Provider
      value={{
        isInitialized,
      }}
    >
      {children}
    </e3Context.Provider>
  );
};

export const useE3 = ({ userId }) => {
  const {
    isInitialized,
  } = useContext(e3Context);

  useEffect(() => {
    userId && setUserId(userId);
  }, [userId]);

  return {
    isInitialized,
  };
};
```

Let's add the Virgil provider to our app
```
// javascript-sample/src/index.js

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { SendbirdProvider } from './utils/sendbird';
import { E3Provider } from './utils/e3';

ReactDOM.render(
  <React.StrictMode>
    <SendbirdProvider>
      <E3Provider>
        <App />
      </E3Provider>
    </SendbirdProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
```

## Configure your client app

### Deciding on an encryption type

Virgil offers a number of different encryption types. This guide will use Sendbird `group channels` with Virgil's `group encryption`.

This is the most common use case we see, but if you are certain your channels will always be `1:1` channels we recommend you use Sendbird `group channels` with another Virgil encryption type, probably `default encryption` or `double ratchet encryption`.

## Implement encrypted messaging

To support encrypted messaging you will need to be able to handle a few steps:

- Register new users with both Sendbird and Virgil Cloud
- Create a Sendbird Group Channel and a corresponding Virgil Group Chat
- Load a Sendbird Group Channel, and the corresponding Virgil Group Chat to load and decrypt its messages
- Encrypt and send a message
- Receive and decrypt messages from other members of the Group Channel

### Create a new Sendbird group channel and Virgil Group Chat

```
// javascript-sample/src/utils/e3.js

export const createGroup = async (groupId, participantIdentities) => {
  try {
    const participants = await e3.findUsers(participantIdentities);
    await e3.createGroup(groupId, participants);
  } catch (error) {
    console.error(error);
  }
};
```

```
// client/lib/sendbird.js

export const createChannel = async (
  state,
  dispatch,
  { channelName, userIds },
) => {
  const sb = Sendbird.getInstance();
  const { currentUser } = state;

  const groupChannelParams = new sb.GroupChannelParams();
  groupChannelParams.name = channelName;
  groupChannelParams.addUserIds(userIds.replace(' ', '').split(','));
  groupChannelParams.data = currentUser.userId;

  sb.GroupChannel.createChannel(groupChannelParams, async (channel, error) => {
    dispatch({ type: actionTypes.ADD_GROUP_CHANNEL, payload: { channel } });
    selectChannel(state, dispatch, { channel });
    await createGroup(channel.url, userIds);
  });
};
```

### Load an existing Sendbird group channel and Virgil Group Chat

```
// client/lib/e3.js

export const decryptMessages = async (channel, messages) => {
  try {
    const group = await loadGroup(channel);

    const decryptedMessagesPromises = messages.map((message) => {
      return decryptMessage(message, group).then((decryptedMessage) => {
        return decryptedMessage;
      });
    });

    return Promise.all(decryptedMessagesPromises);
  } catch (error) {
    console.error(error);
  }
};

export const decryptMessage = async (message, group) => {
  try {
    if (message.messageType === 'user') {
      const senderCart = await e3.findUsers(message.sender.userId);
      message.message = await group.decrypt(message.message, senderCart);
    }
    return message;
  } catch (error) {
    console.error(error);
  }
};
```

```
// client/lib/sendbird.js

export const selectChannel = async (state, dispatch, { channel }) => {
  const { selectedChannel } = state;

  dispatch({
    type: actionTypes.SELECT_CHANNEL,
    payload: { selectedChannel: channel },
  });

  if (channel) {
    if (channel.url === selectedChannel.url) {
      return;
    }
    addChannelHandler(state, dispatch);
    const previousMessageListQuery = channel.createPreviousMessageListQuery();
    dispatch({
      type: actionTypes.SET_MESSAGE_LIST_QUERY,
      payload: { messageListQuery: previousMessageListQuery },
    });
    previousMessageListQuery.load(async (messages, error) => {
      if (!error) {
        const decryptedMessages = await decryptMessages(channel, messages);
        dispatch({
          type: actionTypes.ADD_MESSAGES,
          payload: { messages: decryptedMessages },
        });
      }
    });
  }
};
```

### Send a message

Messages need to be encrypted prior to sending them to the Sendbird Group Channel. Use these methods to take a Sendbird channel and message and return the encrypted message to your chat component for sending.

```
// client/lib/e3.js

export const encryptMessage = async (channel, message) => {
  try {
    const group = await loadGroup(channel);
    return await group.encrypt(message);
  } catch (error) {
    console.error(error);
  }
};

const loadGroup = async (channel) => {
  try {
    const ownerCard = await e3.findUsers(channel.data);
    return await e3.loadGroup(channel.url, ownerCard);
  } catch (error) {
    console.error(error);
  }
};
```

```
// client/lib/sendbird.js

export const sendMessage = async (state, dispatch, { message }) => {
  const { selectedChannel } = state;

  const sb = Sendbird.getInstance();
  const encryptedMessage = await encryptMessage(selectedChannel, message);
  const messageParams = new sb.UserMessageParams();
  messageParams.message = encryptedMessage;
  selectedChannel.sendUserMessage(messageParams, (sentMessage, error) => {
    if (!error) {
      sentMessage.message = message;
      dispatch({
        type: actionTypes.ADD_MESSAGE,
        payload: { message: sentMessage },
      });
    } else {
      console.error(error);
    }
  });
};
```

### Receive a message

Messages will be received by listening for an `onMessageReceived` event in the Sendbird channel handler. The message will arrive encrypted and needs to be decrypted before adding it to the message list.

Use the same decrypt method you used when decrypting messages loaded with the channel

```
// client/lib/e3.js

export const decryptMessage = async (message, group) => {
  try {
    if (message.messageType === 'user') {
      const senderCart = await e3.findUsers(message.sender.userId);
      message.message = await group.decrypt(message.message, senderCart);
    }
    return message;
  } catch (error) {
    console.error(error);
  }
};

```

```
// client/lib/sendbird.js

channelHandler.onMessageReceived = async (channel, message) => {
  const { selectedChannel } = state;
  if (selectedChannel && channel.url === selectedChannel.url) {
    const decryptedMessage = await decryptMessage(channel, message);
    decryptedMessage &&
      dispatch({
      type: actionTypes.ADD_MESSAGE,
      payload: { message: decryptedMessage },
    });
  }
};
```

### Next Steps
This tutorial doesn't include all the functionality needed for a production app. Some of the next items you would want to add are:

- Backup and recover lost keys
- Add a user to a channel
- Remove a user from a channel
