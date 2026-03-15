import React from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

async function readJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return {};
  }
}

export function Login() {
  const navigate = useNavigate();
  const [authMessage, setAuthMessage] = React.useState('');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [currentUsername, setCurrentUsername] = React.useState('');

  const refreshSession = React.useCallback(async () => {
    try {
      const response = await fetch('/api/user/me');
      const data = await readJson(response);
      if (!response.ok) {
        setIsLoggedIn(false);
        setCurrentUsername('');
        return;
      }

      setAuthMessage('');
      setIsLoggedIn(true);
      setCurrentUsername(data.username ?? '');
    } catch (error) {
      setIsLoggedIn(false);
      setCurrentUsername('');
      setAuthMessage('Could not reach server.');
    }
  }, []);

  React.useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const authenticate = async (method, username, password) => {
    try {
      const response = await fetch('/api/auth', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await readJson(response);

      if (!response.ok) {
        setAuthMessage(data.msg || 'Authentication failed.');
        setIsLoggedIn(false);
        setCurrentUsername('');
        return;
      }

      setAuthMessage('');
      setIsLoggedIn(true);
      setCurrentUsername(data.username ?? username);
      navigate('/play');
    } catch (error) {
      setAuthMessage('Could not reach server.');
    }
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const form = event.currentTarget.form ?? event.currentTarget;
    const username = form?.username?.value.trim();
    const password = form?.password?.value ?? '';
    if (!username || !password) {
      setAuthMessage('Enter a username and password.');
      return;
    }
    authenticate('PUT', username, password);
  };

  const handleCreateAccount = (event) => {
    event.preventDefault();
    const form = event.currentTarget.form;
    const username = form?.username?.value.trim();
    const password = form?.password?.value ?? '';
    if (!username || !password) {
      setAuthMessage('Choose a username and password.');
      return;
    }
    authenticate('POST', username, password);
  };

  const handleEnterSubmit = (event) => {
    event.preventDefault();
    setAuthMessage('If you just pressed enter I am sorry but you need to click the button yourself sorry');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } catch (error) {
      // Ignore network errors on logout and clear local UI state.
    }

    setIsLoggedIn(false);
    setCurrentUsername('');
    setAuthMessage('Logged out.');
  };

  return (
    <main className="login-view container-fluid text-center">
      <h1 className="welcome-statement">WELCOME TO THE RED BUTTON GAME!</h1>
      <form className="login-form" onSubmit={handleEnterSubmit}>
        {isLoggedIn ? (
          <div className="d-grid gap-2">
            <div className="login-message">Logged in as {currentUsername || 'player'}.</div>
            <button type="button" className="btn btn-secondary login-button" onClick={handleLogout}>
              LOGOUT
            </button>
          </div>
        ) : (
          <>
            <div className="text-start">
              <label className="form-label login-label" htmlFor="username">
                USERNAME:
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="form-control login-input"
                placeholder="TYPE USERNAME"
              />
            </div>
            <div className="text-start">
              <label className="form-label login-label" htmlFor="password">
                PASSWORD:
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control login-input"
                placeholder="TYPE PASSWORD"
              />
            </div>
            <div className="d-grid gap-2">
              <button type="button" className="btn btn-secondary login-button" onClick={handleLogin}>
                LOGIN
              </button>
              <button
                type="button"
                className="btn btn-secondary login-button"
                onClick={handleCreateAccount}
              >
                CREATE ACCOUNT
              </button>
            </div>
          </>
        )}
        {authMessage ? <div className="login-message">{authMessage}</div> : null}
      </form>
    </main>
  );
}
