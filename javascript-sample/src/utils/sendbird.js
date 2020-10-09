import React, { createContext, useContext, useEffect, useState } from 'react';

const sendbirdContext = createContext();

export const SendbirdProvider = ({ children }) => {
  const [sdk, setSdk] = useState();

  const getAccessToken = async (userId) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/sendbird/accessToken/${userId}`,
    );
    const jsonResponse = await response.json();
    const { accessToken } = jsonResponse;
    return accessToken;
  };

  const createGroupsForChannels = () => {
    // sdk.onb
  };

  const createGroup = () => {

  };

  return (
    <sendbirdContext.Provider
      value={{
        getAccessToken,
        setSdk,
      }}
    >
      {children}
    </sendbirdContext.Provider>
  );
};

export const useSendbird = ({ sdk } = { sdk: null }) => {
  const { getAccessToken, setSdk } = useContext(sendbirdContext);

  useEffect(() => {
    console.log(sdk)
    sdk && setSdk(sdk);
  }, [sdk]);

  return {
    getAccessToken,
  };
};
