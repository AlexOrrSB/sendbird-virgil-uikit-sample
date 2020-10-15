import React from 'react';
import { ChannelList, sendBirdSelectors, withSendBird } from 'sendbird-uikit';

const CustomChannelList = ({ sdk, setCurrentChannelUrl }) => {
  return (
    <ChannelList
      onChannelSelect={(channel) => {
        if (channel && channel.url) {
          setCurrentChannelUrl(channel.url);
        }
      }}
      onBeforeCreateChannel={(selectedUsers) => {
        if (!sdk || !sdk.GroupChannelParams) {
          return;
        }
        const params = new sdk.GroupChannelParams();
        params.addUserIds(selectedUsers);
        params.isDistinct = true;
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
