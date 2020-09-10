import './index.css';

import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  SendBirdProvider,
  ChannelList,
  Channel,
  ChannelSettings,
  withSendBird,
  sendBirdSelectors,
} from 'sendbird-uikit';
import 'sendbird-uikit/dist/index.css';

import ChannelPreview from './ChannelPreview';
import Message from './Message';
import getCustomPaginatedQuery from './CustomUserList';
import { useE3 } from '../utils/e3';

const Chat = ({
  userId,
  accessToken,
  theme,
  nickname,
  useCustomQuery,
  connect,
}) => {
  const {
    encryptMessage,
    decryptMessage,
    decryptMessages,
    createGroup,
  } = useE3({ userId });

  const history = useHistory();
  useEffect(() => {
    if (!userId || !nickname) {
      history.push('/');
    }
  }, [userId, nickname, history]);

  const [showSettings, setShowSettings] = useState(false);
  const [currentChannelUrl, setCurrentChannelUrl] = useState(null);

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
        <div className='sendbird-app__wrap'>
          <div className='sendbird-app__channellist-wrap'>
            <ChannelList
              renderChannelPreview={ChannelPreview}
              onChannelSelect={(channel) => {
                if (channel && channel.url) {
                  setCurrentChannelUrl(channel.url);
                }
              }}
            />
          </div>
          <div className='sendbird-app__conversation-wrap'>
            <Channel
              renderChatItem={Message}
              channelUrl={currentChannelUrl}
              onChatHeaderActionClick={() => {
                setShowSettings(true);
              }}
            />
          </div>
        </div>
        {showSettings && (
          <div className='sendbird-app__settingspanel-wrap'>
            <ChannelSettings
              channelUrl={currentChannelUrl}
              onCloseClick={() => {
                setShowSettings(false);
              }}
            />
          </div>
        )}
      </SendBirdProvider>
    </div>
  );
};

const ChatWithSendbird = withSendBird(Chat, (state) => {
  return { sdk: () => sendBirdSelectors.getSdk(state) };
});

export default Chat;
