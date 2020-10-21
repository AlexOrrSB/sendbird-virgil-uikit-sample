import React from 'react';
import { Channel, sendBirdSelectors, withSendBird } from 'sendbird-uikit';
import CustomMessageInput from './CustomMessageInput';
import { useE3 } from './utils/e3';

const CustomChannel = ({ sdk, currentChannel, setShowSettings }) => {
  const userId = sdk?.currentUser?.userId;
  const { encryptMessage } = useE3({ userId });

  const onChatHeaderActionClick = () => {
    setShowSettings(true);
  };

  return (
    <Channel
      channelUrl={currentChannel?.url}
      onChatHeaderActionClick={onChatHeaderActionClick}
      renderMessageInput={({ channel, user, disabled }) => (
        <CustomMessageInput channel={channel} disabled={disabled} encryptMessage={encryptMessage} />
      )}
    />
  );
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
