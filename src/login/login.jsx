import React from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

export function Login() {
  const navigate = useNavigate();
  const [authMessage, setAuthMessage] = React.useState('');

  const loadUsers = () => {
    const usersText = localStorage.getItem('users');
    if (!usersText) return {};
    try {
      const parsed = JSON.parse(usersText);
      if (Array.isArray(parsed)) {
        return parsed.reduce((acc, name) => {
          acc[name] = '';
          return acc;
        }, {});
      }
      return parsed;
    } catch (error) {
      return {};
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
    const users = loadUsers();
    if (!users[username]) {
      setAuthMessage('Username not found, please create an account.');
      return;
    }
    if (users[username] !== password) {
      setAuthMessage('Incorrect password.');
      return;
    }
    localStorage.setItem('userName', username);
    localStorage.setItem('authMode', 'login');
    setAuthMessage('');
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
    if (users[username]) {
      setAuthMessage('Username already exists, please press login button instead.');
      return;
    }
    users[username] = password;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('userName', username);
    localStorage.setItem('authMode', 'create');
    setAuthMessage('');
    navigate('/play');
  };

  const handleEnterSubmit = (event) => {
    event.preventDefault();
    setAuthMessage('If you just pressed enter I am sorry but you need to click the button yourself sorry');
  };

  return (
    <main className="login-view container-fluid text-center">
      <h1 className="welcome-statement">WELCOME TO THE RED BUTTON GAME!</h1>
      <form className="login-form" onSubmit={handleEnterSubmit}>
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
        {authMessage ? <div className="login-message">{authMessage}</div> : null}
      </form>
    </main>
  );
}
