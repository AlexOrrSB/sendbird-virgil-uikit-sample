import React from 'react';
import { ChannelList, sendBirdSelectors, withSendBird } from 'sendbird-uikit';
import { useE3 } from './utils/e3';

const CustomChannelList = ({ sdk, setCurrentChannelUrl }) => {
  const userId = sdk?.currentUser?.userId;
  const { createGroup } = useE3({ userId });

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
