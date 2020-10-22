import React, { createContext, useContext, useEffect, useState } from 'react';

const sendbirdContext = createContext();

export const SendbirdProvider = ({ children }) => {
  const getAccessToken = async (userId) => {
    const response = await fetch(
      `${process.env.REACT_APP_API_BASE_URL}/sendbird/accessToken/${userId}`,
    );
    const jsonResponse = await response.json();
    const { accessToken } = jsonResponse;
    return accessToken;
  };

  return (
    <sendbirdContext.Provider
      value={{
        getAccessToken,
      }}
    >
      {children}
    </sendbirdContext.Provider>
  );
};

export const useSendbird = () => {
  const { getAccessToken } = useContext(sendbirdContext);

  return {
    getAccessToken,
  };
};
