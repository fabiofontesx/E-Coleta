import { BrowserRouter, Route } from 'react-router-dom';
import React from 'react';


import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';

const Routes: React.FC = () => {
  return (
    <BrowserRouter>
        <Route exact path="/" component={Home}/>
        <Route exact path="/create-point" component={CreatePoint}/>
    </BrowserRouter>
  );
}

export default Routes;