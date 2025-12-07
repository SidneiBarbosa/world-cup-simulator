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
  
  // Initialize Session on Load
useEffect(() => {
    let sessionId = localStorage.getItem('sim_session_id');

    if (!sessionId) {
      console.log("Starting new session...");
      
      // 1. Get new ID from backend
      axios.get('https://[YOUR_BACKEND_DOMAIN_NAME]/api/sim/start')
        .then(response => {
          const newId = response.data.sessionId;
          // 2. Save the ID
          localStorage.setItem('sim_session_id', newId);
          console.log("New session ID saved:", newId);
        })
        .finally(() => {
          // 3. Set the state to true *after* the API call finishes (success or fail)
          setIsSessionInitialized(true); 
        });
    } else {
      // If ID exists, mark initialization as complete immediately
      console.log("Existing session ID found.");
      setIsSessionInitialized(true);
    }
  }, []);

  if (!isSessionInitialized) {
    // Show a loading screen while waiting for the API call to complete
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