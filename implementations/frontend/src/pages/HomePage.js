import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <h2>Welcome to Booth Organizer</h2>
      <p>
        <Link to="/events">Browse Events</Link>
      </p>
    </div>
  );
}

export default HomePage;
