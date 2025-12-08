import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

// Import Pages
import GroupSimulator from './pages/GroupSimulator';
import KnockoutPage from './pages/KnockoutPage';
import PlayoffSelector from './pages/PlayoffSelector'; // <--- Import the new page

// 1. Home Component (The Landing Page)
function Home() {
  return (
    <div className="p-10 text-center min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-5xl font-extrabold mb-4 text-blue-900">World Cup 2026 Simulator</h1>
      <p className="text-xl text-gray-600 mb-10">Select playoffs, simulate groups, and predict the champion.</p>
      
      <div className="flex justify-center gap-6">
        {/* UPDATED LINK: Goes to /playoffs first */}
        <Link 
          to="/playoffs" 
          className="bg-green-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-green-700 font-bold text-lg transition-transform hover:scale-105"
        >
          Start Simulator
        </Link>

        {/* Shortcut to Groups (Optional, if you want to skip playoffs later) */}
        <Link 
          to="/groups" 
          className="bg-gray-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-gray-700 font-bold text-lg transition-transform hover:scale-105"
        >
          Go to Groups
        </Link>
      </div>
    </div>
  );
}

// 2. Main App Component (Routes & Logic)
export default function App() {
  const [isSessionInitialized, setIsSessionInitialized] = useState(false);
  const [connectionError, setConnectionError] = useState(null); // <--- New State

  useEffect(() => {
    let sessionId = localStorage.getItem('sim_session_id');

    if (!sessionId) {
      console.log("Starting new session...");
      
      axios.get('/api/sim/start')
        .then(response => {
          const newId = response.data.sessionId;
          localStorage.setItem('sim_session_id', newId);
          console.log("New session ID saved:", newId);
          setIsSessionInitialized(true); // <--- Only set true on SUCCESS
        })
        .catch(error => {
          console.error("Session Start Failed:", error);
          // Show the error on screen so you know why it failed
          setConnectionError("Could not connect to Backend. Please try again in a moment.");
        });
    } else {
      console.log("Existing session ID found.");
      setIsSessionInitialized(true);
    }
  }, []);

  // 1. SHOW ERROR SCREEN IF FAILED
  if (connectionError) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen text-red-600 p-5 text-center">
              <h1 className="text-2xl font-bold mb-4">Connection Error</h1>
              <p>{connectionError}</p>
              <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
              >
                  Retry
              </button>
          </div>
      );
  }

  // 2. SHOW LOADING SCREEN
  if (!isSessionInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Initializing Session...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/playoffs" element={<PlayoffSelector />} /> {/* <--- New Route */}
      <Route path="/groups" element={<GroupSimulator />} />
      <Route path="/knockout" element={<KnockoutPage />} />
    </Routes>
  );
}