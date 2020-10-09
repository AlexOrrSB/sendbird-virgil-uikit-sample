import React, { Fragment, useState } from 'react';

import { ChannelList, Channel, ChannelSettings, withSendBird } from 'sendbird-uikit';

import { useE3 } from '../utils/e3';
import ChannelPreview from './ChannelPreview';
import Message from './Message';

const ChatWithState = ({ userId, state }) => {
  const {
    encryptMessage,
    decryptMessage,
    decryptMessages,
    createGroup,
  } = useE3({ userId });

  const [showSettings, setShowSettings] = useState(false);
  const [currentChannelUrl, setCurrentChannelUrl] = useState(null);


  return (
    <Fragment>
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
    </Fragment>
  );
};

const mapSendbirdStateToProps = (state) => {
  return {
    state,
  };
};

export default withSendBird(ChatWithState, mapSendbirdStateToProps);
