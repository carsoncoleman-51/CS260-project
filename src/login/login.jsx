import React from 'react';
import './login.css';

export function Login() {
  return (
    <main className="container-fluid bg-secondary text-center">
    <h1 className="welcome-statement">Welcome to THE RED BUTTON GAME!</h1>
        <img src='./public/red_button_image.png' alt="Red Button" className="red-button-image" style={{maxWidth: '400px', width: '100%', height: 'auto'}} />
        <form method="get" action="play.html">
          <div>
            <span>Username:</span>
            <input type="text" placeholder="type username" />
          </div>
          <div>
            <span>Password:</span>
            <input type="password" placeholder="type password" />
          </div>
          <button type="submit" className="btn btn-secondary">Login</button>
          <button type="submit" className="btn btn-secondary">Create Account</button>
        </form>    </main>
  );
}