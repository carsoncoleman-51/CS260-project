import React from 'react';
import './login.css';

export function Login() {
  return (
    <main className="login-view container-fluid text-center">
      <h1 className="welcome-statement">WELCOME TO THE RED BUTTON GAME!</h1>
      <form className="login-form" method="get" action="/play">
        <div className="text-start">
          <label className="form-label login-label" htmlFor="username">
            USERNAME:
          </label>
          <input
            id="username"
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
            type="password"
            className="form-control login-input"
            placeholder="TYPE PASSWORD"
          />
        </div>
        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-secondary login-button">
            LOGIN
          </button>
          <button type="button" className="btn btn-secondary login-button">
            CREATE ACCOUNT
          </button>
        </div>
      </form>
    </main>
  );
}
