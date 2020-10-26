import React, { useEffect, useState } from 'react';

import './Chat.css';

import { useHistory } from 'react-router-dom';
import { SendBirdProvider, ChannelSettings } from 'sendbird-uikit';
import 'sendbird-uikit/dist/index.css';

import CustomChannel from './CustomChannel';
import CustomChannelList from './CustomChannelList';
import { useE3 } from './utils/e3';

const Chat = ({ userId, accessToken, nickname, theme }) => {
  const history = useHistory();
  useEffect(() => {
    if (!userId || !nickname) {
      history.push('/');
    }
  }, [userId, nickname, history]);
  const [showSettings, setShowSettings] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null);
  const { registerUser } = useE3({ userId });

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
            <CustomChannelList setCurrentChannel={setCurrentChannel} />
          </div>
          <div className='sendbird-app__conversation-wrap'>
            <CustomChannel
              currentChannel={currentChannel}
              setShowSettings={setShowSettings}
            ></CustomChannel>
          </div>
        </div>
        {showSettings && (
          <div className='sendbird-app__settingspanel-wrap'>
            <ChannelSettings
              channelUrl={currentChannel?.url}
              onCloseClick={() => {
                setShowSettings(false);
              }}
            />
          </div>
        )}
      </SendBirdProvider>
      <button onClick={registerUser}>Register User With Virgil</button>
    </div>
  );
};

export default Chat;
