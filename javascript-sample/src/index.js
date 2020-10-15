import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { SendbirdProvider } from './utils/sendbird';
import { E3Provider } from './utils/e3';

ReactDOM.render(
  <React.StrictMode>
    <SendbirdProvider>
      <E3Provider>
        <App />
      </E3Provider>
    </SendbirdProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
