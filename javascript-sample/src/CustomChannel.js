import React, { Fragment } from 'react';
import { Channel, sendBirdSelectors, withSendBird } from 'sendbird-uikit';
import CustomMessage from './CustomMessage';
import CustomMessageInput from './CustomMessageInput';
import { useE3 } from './utils/e3';

const CustomChannel = ({ sdk, currentChannel, setShowSettings }) => {
  const userId = sdk?.currentUser?.userId;
  const { isInitialized, encryptMessage, decryptMessages } = useE3({ userId });

  const onChatHeaderActionClick = () => {
    setShowSettings(true);
  };

  if (isInitialized) {
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
              decryptMessages={(message) =>
                decryptMessages(currentChannel, [message])
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
  } else {
    return <Fragment></Fragment>;
  }
};

const mapSendbirdStateToProps = (state) => {
  return {
    sdk: sendBirdSelectors.getSdk(state),
  };
};

const CustomChannelWithSendbird = withSendBird(
  CustomChannel,
  mapSendbirdStateToProps,
);

export default CustomChannelWithSendbird;
