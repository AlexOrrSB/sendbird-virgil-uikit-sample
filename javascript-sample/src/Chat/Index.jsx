import './index.css';

import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  SendBirdProvider,
} from 'sendbird-uikit';
import 'sendbird-uikit/dist/index.css';

import getCustomPaginatedQuery from './CustomUserList';
import ChatWithState from './ChatWithState';

const Chat = ({
  userId,
  accessToken,
  theme,
  nickname,
  useCustomQuery,
}) => {
  const history = useHistory();
  useEffect(() => {
    if (!userId || !nickname) {
      history.push('/');
    }
  }, [userId, nickname, history]);

  return (
    <div style={{ height: '100vh' }}>
      <SendBirdProvider
        appId={process.env.APP_ID}
        theme={theme}
        userId={userId}
        accessToken={accessToken}
        nickname={nickname}
        userListQuery={useCustomQuery ? getCustomPaginatedQuery : null}
      >
        <ChatWithState userId={userId}></ChatWithState>
      </SendBirdProvider>
    </div>
  );
};


export default Chat
