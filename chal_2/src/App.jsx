// App.jsx
import React from 'react';
import MyNavbar from './components/Navbar';
import Admin from './components/Admin';
import Projects from './components/Projects';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

function App() {
  return (
    <div>
      <MyNavbar />
      <Router>
        <Routes>
          <Route path = "/admin" element = {<Admin/>}/>
          <Route path = "/project" element = {<Projects/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
