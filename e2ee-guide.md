# End-to-End Encryption for Sendbird Chat

## Overview

### What is end-to-end encryption

End-to-end encryption is a system of communication in which only the users communicating are capable of reading the messages being transmitted. In the context of SendBird, end-to-end encryption means that SendBird systems and personnel are unable to access the message content. All communications in SendBird are encrypted at the transport level while in motion and at the persistence level when at rest.

This adds an additional level of encryption at the message payload level such that ciphertext is transmitted, stored and retrieved. Only users with access to the private key used to encrypt the data are able to read the contents. End-to-end encryption is a powerful tool for enhancing the privacy guarantees of SendBird messaging and is often a requirement in regulated industries with compliance requirements on data accessibility. More information can be found [here](https://ssd.eff.org/en/module/deep-dive-end-end-encryption-how-do-public-key-encryption-systems-work) and [here](https://en.wikipedia.org/wiki/End-to-end_encryption).

### Why use Virgil's E3Kit with Sendbird

According to Virgil's website:

> - **Full Security**: Full privacy: Only user can read their own messages; Sendbird, Virgil and other third-party services cannot decrypt and access messages and data.
> - **Complete end-to-end encryption**: User's data is always encrypted and protected - at rest and in transit.
> - **Independent data protection**: With E3Kit your data protection doesn't rely on any network and service providers, so any attacks on them won't influence the data integrity and confidentiality.
> - **Data integrity**: The E3Kit signs and verifies data as part of the encrypt and decrypt functions. This confirms that data is actually coming from the user who encrypted it and that it hasn't been tampered with in transit or storage.

## Examples

- [JavaScript](https://github.com/AlexOrrSB/sendbird-virgil-uikit-sample)

## Get Started

### Create a Sendbird Application

[Sign up](https://dashboard.sendbird.com/auth/signup) for a free Sendbird account and create a new chat application.

### Create users in the Sendbird dashboard

Create users in the Sendbird dashboard in the `users` section. Issue the new users an access token so that they can only connect the Sendbird client SDK if they first retrieve the access token. This is a best practice and although unsecured in this tutorial, the endpoint to retrieve the Sendbird access token can be behind your own application's authentication.

### Create a Virgil Account

[Sign up](https://dashboard.virgilsecurity.com/signup) for a free Virgil account and create a new applicaton.

## Setup your backend

### Configure your backend

Add your `SENDBIRD_APP_ID`, `SENDBIRD_API_TOKEN`, `VIRGIL_APP_ID`, `VIRGIL_APP_KEY`, `VIRGIL_APP_KEY_ID` to your .env file

### Set up your server

You will need a server to retrieve Sendbird access tokens and Virgil JWTs. In this example we'll set up a simple Express server.

```
// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { virgilRouter } = require('./virgil');
const { sendbirdRouter } = require('./sendbird');

const app = express();
const port = 6789;

app.use(cors());

app.use('/virgil', virgilRouter);
app.use('/sendbird', sendbirdRouter);

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`),
);
```

### Provide users access to Sendbird and Virgil Cloud

Provide users a [Virgil JWT](https://developer.virgilsecurity.com/docs/e3kit/get-started/generate-client-tokens/) and [Sendbird access/session token](https://docs.sendbird.com/platform/user#3_create_a_user_4_access_token_vs_session_token) from your backend.

In a production application this request should require authentication.

We will have an endpoint to get a Sendbird user's accessToken to authenticate with the Sendbird SDK.

```
// server/sendbird.js
const express = require('express');
const fetch = require('node-fetch');

const appId = process.env.SENDBIRD_APP_ID;
const apiToken = process.env.SENDBIRD_API_TOKEN;
const sendbirdBaseUrl = `https://api-${appId}.sendbird.com`;
const headers = {
  'Content-Type': 'application/json',
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
  const { params } = req;
  const { userId } = params;

  const user = await getUser(userId);
  const accessToken = user.access_token;
  res.status(200).json({ accessToken });
});

module.exports = { sendbirdRouter, getUser };
```

We also need to get a JWT for Virgil user's in order to initialize the client side SDK.

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

Start with [a Sendbird JavaScript sample app](https://github.com/sendbird/SendBird-JavaScript). We're going to use the [Sendbird JavaScript UIkit Custom Sample](https://github.com/sendbird/SendBird-JavaScript/tree/master/uikit-samples/custom-react-app) as a starting point. This gives us a starter app with some custom components we can quickly modify.

#### iOS

Start with [a Sendbird iOS sample app](https://github.com/sendbird/SendBird-iOS)

#### Android

Start with [a Sendbird Android sample app](https://github.com/sendbird/SendBird-Anrdoid)

### Add Virgil's E3Kit to your client application

Follow the directions in the [Virgil documentation](https://developer.virgilsecurity.com/docs/e3kit/get-started/setup-client/#install-e3kit)

#### JavaScript

We need to add Virgil's e3kit-browser SDK. You can use yarn or npm.

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

For convenience we will create a hook for all the Virgil functionality. This way we can initialize the Virgil SDK once when the user connects, and then use helper functions to easily perform Vigil actions from our chat components. To start we will just have functions to retrieve the Virgil SDK token from our server and initialize the Virgil e3 SDK. We will add all of the encryption / decryption functionality to this as we move along.

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
    const e3 = await EThree.initialize(() => getVirgilToken(userId));
    setE3(e3);
    setIsInitialized(true);
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

Let's add the Virgil provider to our app. This makes our Virgil hook accessible anywhere in our chat application.

```
// javascript-sample/src/index.js

...

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
- Encrypt and send a message
- Load a Sendbird Group Channel, and the corresponding Virgil Group Chat to load and decrypt its messages

### Register a user with Virgil on signup

When a user is created with Sendbird a client needs to register with Virgil. This only needs to be done on user signup. After a user is registered they will be able to use Virgil on that device as long as the user's private key stays stored on the device. If it is lost or access is needed on another device it is best to use key backup and recovery which is outside the scope of this tutorial.

#### JavaScript

Since we are creating our Sendbird users using the dashboard there is not a client side user registration flow to trigger this action. If you have a signup flow, it is best to register a user then. For simplicity you can simply create a button to manually call this method for any users that haven't been registered with Virgil. All users will need to be registered with Virgil before they can be added to group channels, send messages, or read messages.

```
// javascript-sample/src/utils/e3.js
...

const registerUser = async () => {
  e3.register()
}
```

Register users if they were created in the Sendbird dashboard, but haven't been registered with Virgil. This is only required once per user. In a production application this would be part of your user signup flow and backing up / restoring your key would allow you to retrieve an existing key for already registered users.

```
// javascript-sample/src/Chat.js
import { useE3 } from './utils/e3';

const Chat = ({ userId, accessToken, nickname, theme }) => {
    const { registerUser } = useE3({ userId });

    ...

    return (
      ...
      <button onClick={registerUser}>Register User With Virgil</button>
      ...
    )
}
```

### Create a new Sendbird group channel and Virgil Group Chat

When a Sendbird group channel is created we need to create a corresponding Virgil group. Virgil groups have an owner whose ID is required to load the channel. We store this ID in the data field of the Sendbrd group channel so that non-owner channel members can load the channel later. Virgil handles making sure that messages can only be decrypted by group members.

#### JavaScript

Add methods to create Virgil groups. We will make the groupId the Sendbird channel url and the participant identities their Sendbird user ids.

```
// javascript-sample/src/utils/e3.js

const createGroup = async (groupId, participantIdentities) => {
  const participants = await e3.findUsers(participantIdentities);
  await e3.createGroup(groupId, participants);
};

const loadGroup = async (channel) => {
  const { ownerId, groupId } = JSON.parse(channel.data);
  const ownerCard = await e3.findUsers(ownerId);
  return await e3.loadGroup(groupId, ownerCard);
};
```

We can make a custom channel list component in order to create a Virgil group when creating a Sendbird group channel. We need to map the Sendbird UIKit's state to our component's props in order to get the current userId.

```
// javascript-sample/src/CustomChannelList.js

...

const CustomChannelList = ({ sdk, setCurrentChannel }) => {
  const userId = sdk?.currentUser?.userId;
  const { createGroup } = useE3({ userId });

  return (
    <ChannelList
      onChannelSelect={(channel) => {
        if (channel && channel.url) {
          setCurrentChannel(channel);
        }
      }}
      onBeforeCreateChannel={(selectedUsers) => {
        if (!sdk || !sdk.GroupChannelParams) {
          return;
        }
        const params = new sdk.GroupChannelParams();
        params.addUserIds(selectedUsers);
        const groupId = cuid();
        params.data = JSON.stringify({ ownerId: userId, groupId });
        const identites = [userId, ...selectedUsers];
        createGroup(groupId, identites);
        return params;
      }}
    ></ChannelList>
  );
};

const mapSendbirdStateToProps = (state) => {
  return {
    sdk: sendBirdSelectors.getSdk(state),
  };
};

const CustomChannelListWithSendbird = withSendBird(
  CustomChannelList,
  mapSendbirdStateToProps,
);

export default CustomChannelListWithSendbird;
```

### Send a message

Messages need to be encrypted prior to sending them to the Sendbird Group Channel. When a user sends a message we encrypt the message and then send the message using the Sendbird SDK. This example is for text messages, but Virgil also supports encrypted files. We are going to mark messages we send as encrypted, using the data field, so that we only try to decrypt messages that require us to do so.

#### Javascript

We will add some helpers to our Virgil hook to support encrypting messages. Since we are using group encryption we also need to load the group.

```
// javascript-sample/src/utils/e3.js

export const encryptMessage = async (channel, message) => {
  const group = await loadGroup(channel);
  return await group.encrypt(message);
};

const loadGroup = async (channel) => {
  const ownerCard = await e3.findUsers(channel.data);
  return await e3.loadGroup(channel.url, ownerCard);
};
```

We will add a custom message input in our channel component so that we can first encrypt the message prior to sending. We will do this with the renderMessageInput prop of our CustomChannel component and a CustomMessageInput component.

```
// javascript-sample/src/CustomChannel.js

...
const CustomChannel = ({ sdk, currentChannel, setShowSettings }) => {
  const userId = sdk?.currentUser?.userId;
  const { encryptMessage, decryptMessage } = useE3({ userId });

  ...

  return (
        <Channel
          channelUrl={currentChannel?.url}
          onChatHeaderActionClick={onChatHeaderActionClick}
          renderMessageInput={({ channel, user, disabled }) => (
            <CustomMessageInput
              channel={channel}
              disabled={disabled}
              encryptMessage={encryptMessage}
            />
          )}
        />
      );

  ...
```

The CustomMesssageInput component will encrypt text messages prior to sending them.

```
// javascript-sample/src/CustomMessageInput.js

...

function CustomMessageInput({
  channel,
  encryptMessage,
  disabled,
  sendUserMessage,
  sendFileMessage,
  sdk,
}) {

  ...

  // state
  const [inputText, setInputText] = useState('');
  const isInputEmpty = inputText.length < 1;

  // event handler
  const handleChange = (event) => {
    setInputText(event.target.value);
  };

  ...

  const sendUserMessage_ = (event) => {
    encryptMessage(channel, inputText).then((encryptedMessage) => {
      const params = new sdk.UserMessageParams();
      params.message = encryptedMessage;
      params.data = JSON.stringify({ isEncrypted: true });
      sendUserMessage(channel.url, params)
        .then((message) => {
          setInputText('');
        })
        .catch((error) => {
          console.log(error.message);
        });
    });
  };

  return (
    <div className='customized-message-input'>
      <FormControl variant='outlined' disabled={disabled} fullWidth>
        <InputLabel htmlFor='customized-message-input'>User Message</InputLabel>
        <OutlinedInput
          id='customized-message-input'
          type='txt'
          value={inputText}
          onChange={handleChange}
          labelWidth={105}
          multiline
          endAdornment={
            <InputAdornment position='end'>
              {isInputEmpty ? (
                ...
              ) : (
                <IconButton disabled={disabled} onClick={sendUserMessage_}>
                  <SendIcon color={disabled ? 'disabled' : 'primary'} />
                </IconButton>
              )}
            </InputAdornment>
          }
        />
      </FormControl>
    </div>
  );
}

const mapStoreToProps = (store) => {
  const sendUserMessage = sendBirdSelectors.getSendUserMessage(store);
  const sdk = sendBirdSelectors.getSdk(store);
  const sendFileMessage = sendBirdSelectors.getSendFileMessage(store);
  return {
    sendUserMessage,
    sdk,
    sendFileMessage,
  };
};

export default withSendBird(CustomMessageInput, mapStoreToProps);
```

### Decrypt messages in an existing group channel

Members of a channel need to decrypt messages before they can read them. Virgil's group encryption will handle this if the user is part of the Virgil Group.

#### JavaScript

We can add some more helper functions to our Virgil hook for decrypting messages. If your implementation decrypts messages upon loading you can decrypt them all at once, but regardless everything will be handled by the private \_decryptMessage function. In this implementation, messages are decrypted when they are rendered so they are handled one by one. That way the same behavior exists whether decrypting one or many messages for a channel.

```
// javascript-sample/src/utils/e3.js

const _decryptMessage = async (message, group) => {
  if (message.messageType === 'user' && message.sender) {
    const senderCart = await e3.findUsers(message.sender.userId);
    const decryptedMessage = await group.decrypt(
      message.message,
      senderCart,
    );
    return decryptedMessage;
  }
  return;
  };

  const decryptMessage = async (channel, message) => {
    const decryptedMessages = await decryptMessages(channel, [message]);
    return decryptedMessages.pop();
  };

  const decryptMessages = async (channel, messages) => {
    const group = await loadGroup(channel);

    const decryptedMessagesPromises = messages.map((message) => {
      return _decryptMessage(message, group).then((decryptedMessage) => {
        return decryptedMessage;
      });
    });

    return Promise.all(decryptedMessagesPromises);
  };
```

Let's get our decryptMessage method from our hook and pass it to a CustomMessage component so that the message can be decrypted when it is rendered.

```
// javascript-sample/src/CustomMessage.js

...
const CustomChannel = ({ sdk, currentChannel, setShowSettings }) => {
  const userId = sdk?.currentUser?.userId;
  const { encryptMessage, decryptMessage } = useE3({ userId });

  ...

  return (
        <Channel
          channelUrl={currentChannel?.url}
          onChatHeaderActionClick={onChatHeaderActionClick}
          renderChatItem={({ message, onDeleteMessage, onUpdateMessage }) => {
            return (
              <CustomMessage
                message={message}
                onDeleteMessage={onDeleteMessage}
                onUpdateMessage={onUpdateMessage}
                decryptMessage={(message) =>
                  decryptMessage(currentChannel, message)
                }
              ></CustomMessage>
            );
          }}
          renderMessageInput={({ channel, user, disabled }) => (
            <CustomMessageInput
              channel={channel}
              disabled={disabled}
              encryptMessage={encryptMessage}
            />
          )}
        />
      );

  ...
```

For encrypted messages our CustomMessage component will display a placeholder while the message is decrypted asynchronously and then will display the message content once complete.

```
// javascript-sample/src/CustomMessage.js

...

const CustomMessage = ({
  message,
  decryptMessage,
  onDeleteMessage,
  onUpdateMessage,
}) => {
  const [decryptedMessage, setDecryptedMessage] = useState('');

  if (message.message && message.data) {
    const data = JSON.parse(message.data);
    if (data.isEncrypted) {
      decryptMessage(message).then((decryptedMessage) => {
        if (decryptedMessage) {
          setDecryptedMessage(decryptedMessage);
        }
      });
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ width: 360 }}>
        {message.messageType === 'file' ? (
          <Link
            target='_blank'
            rel='noreferrer'
            variant='body2'
            href={message.url}
          >
            {message.name}
          </Link>
        ) : (
          `${decryptedMessage || 'ENCRYPTED MESSAGE'}`
        )}
      </div>
      <div>
        {new Date(message.createdAt).toDateString()}
        {` by
            ${
              message.messageType === 'admin'
                ? 'Channel Admin'
                : message.sender && message.sender.userId
            }
          `}
      </div>
    </div>
  );
};

export default CustomMessage;
```

### Next Steps

This tutorial doesn't include all the functionality needed for a production app. Some of the next items you would want to add are:

- [Backup and recover lost keys](https://developer.virgilsecurity.com/docs/e3kit/key-backup/)
  - This is needed for users that are already registered who need to add their key to a new device or to backup and recover a lost key
- Decrypt last message field in the channel list preview
  - The Sendbird [channel object](https://docs.sendbird.com/platform/group_channel#_4_resource_representation) shows the most recent message as a preview in the channel list. If this is a text message, this could be decrypted to display the preview to the user
- Add a user to a channel
  - When a user is [added to a Sendbird group channel](https://docs.sendbird.com/platform/group_channel#3_invite_as_members) they should also be [added to the Virgil group](https://developer.virgilsecurity.com/docs/e3kit/end-to-end-encryption/group-chat/#add-new-participant) that corresponds to the channel in order to send and read messages in the channel.
- Remove a user from a channel
  - When a [user is removed from a Sendbird group channel](https://docs.sendbird.com/platform/group_channel#3_leave_a_channel) they lose the ability to retrieve the encrypted messages. If, however, they still had these cached locally they would be able to decrypt these messages unless they were also [removed from the Virgil group](https://developer.virgilsecurity.com/docs/e3kit/end-to-end-encryption/group-chat/#remove-participant) that corresponds the Sendbird group channel.
