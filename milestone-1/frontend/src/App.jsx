import React from 'react';
import './App.css';
import DriverSearch from './components/Drivers';

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>F1 App</h1>
      </header>
      <main>
        <DriverSearch />
      </main>
    </div>
  );
};

export default App;