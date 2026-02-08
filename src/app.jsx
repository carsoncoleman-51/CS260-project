import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Play } from './play/play';
import { Scores } from './scores/scores';

export default function App() {
  return (
    <BrowserRouter>
        <div>
            <header> 
                <h1 id="game-title">THE <span class="red-word">RED</span> BUTTON GAME</h1>
                <nav>
                    <ul>
                        <li><NavLink to="/">Login</NavLink></li>
                        <li><NavLink to="/play">Play</NavLink></li>
                        <li><NavLink to="/scores">Scores</NavLink></li>
                    </ul>
                </nav>
            </header>

            <main> 
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/play" element={<Play />} />
                    <Route path="/scores" element={<Scores />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>

            <footer> 
                <span> Carson Coleman </span>
                <a href="https://github.com/carsoncoleman-51/CS260-project">GitHub</a>
            </footer>
        </div>
    </BrowserRouter>
    );
}

function NotFound() {
    return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
  }