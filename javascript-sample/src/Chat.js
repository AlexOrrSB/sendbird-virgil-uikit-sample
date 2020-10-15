import React, { useEffect, useState } from 'react';

import './Chat.css';

import { useHistory } from 'react-router-dom';
import { SendBirdProvider, Channel, ChannelSettings } from 'sendbird-uikit';
import 'sendbird-uikit/dist/index.css';

import CustomChannelList from './CustomChannelList';

const Chat = ({ userId, accessToken, nickname, theme }) => {
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
        userId={userId}
        accessToken={accessToken}
        nickname={nickname}
        theme={theme}
      >
        <div className='sendbird-app__wrap'>
          <div className='sendbird-app__channellist-wrap'>
            <CustomChannelList setCurrentChannelUrl={setCurrentChannelUrl} />
          </div>
          <div className='sendbird-app__conversation-wrap'>
            <Channel
              channelUrl={currentChannelUrl}
              onChatHeaderActionClick={() => {
                setShowSettings(true);
              }}
              onBefore
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

export default Chat;
