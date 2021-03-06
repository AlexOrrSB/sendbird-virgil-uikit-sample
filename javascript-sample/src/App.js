import React, { useState } from 'react';
import './App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import Login from './Login';
import Chat from './Chat';

function App() {
  const [config, setconfig] = useState({});
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/chat">
            <Chat
              userId={config.userId}
              accessToken={config.accessToken}
              nickname={config.nickname}
              theme={config.theme}
            />
          </Route>
          <Route path="/">
            <Login onSubmit={setconfig} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
