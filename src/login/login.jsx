import React from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

export function Login() {
  const navigate = useNavigate();
  const [authMessage, setAuthMessage] = React.useState('');
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const loadUsers = () => {
    const usersText = localStorage.getItem('users');
    if (!usersText) return [];
    try {
      const parsed = JSON.parse(usersText);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  React.useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (!storedName) {
      setIsLoggedIn(false);
      return;
    }
    const users = loadUsers();
    const exists = users.some((entry) => entry.name === storedName);
    if (exists) {
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem('userName');
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogin = (event) => {
    event.preventDefault();
    const form = event.currentTarget.form ?? event.currentTarget;
    const username = form?.username?.value.trim();
    const password = form?.password?.value ?? '';
    if (!username || !password) {
      setAuthMessage('Enter a username and password.');
      return;
    }
    const users = loadUsers();
    const user = users.find((entry) => entry.name === username);
    if (!user) {
      setAuthMessage('Username not found, please create an account.');
      return;
    }
    if (user.password !== password) {
      setAuthMessage('Incorrect password.');
      return;
    }
    localStorage.setItem('userName', username);
    setAuthMessage('');
    setIsLoggedIn(true);
    navigate('/play');
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
    const users = loadUsers();
    if (users.some((entry) => entry.name === username)) {
      setAuthMessage('Username already exists, please press login button instead.');
      return;
    }
    users.push({
      name: username,
      password,
      score: 0,
      date: '',
    });
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('userName', username);

    setAuthMessage('');
    setIsLoggedIn(true);
    navigate('/play');
  };

  const handleEnterSubmit = (event) => {
    event.preventDefault();
    setAuthMessage('If you just pressed enter I am sorry but you need to click the button yourself sorry');
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
   
    setIsLoggedIn(false);
    setAuthMessage('Logged out.');
  };

  return (
    <main className="login-view container-fluid text-center">
      <h1 className="welcome-statement">WELCOME TO THE RED BUTTON GAME!</h1>
      <form className="login-form" onSubmit={handleEnterSubmit}>
        {isLoggedIn ? (
          <div className="d-grid gap-2">
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
