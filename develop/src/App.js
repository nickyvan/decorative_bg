import React, { Component } from 'react';
import galaxy from './animation/galaxy';
import './App.css';
class App extends Component {
  componentDidMount(){
    new galaxy();
  }
  render() {
    return (
      <div className="App">
        <canvas className="canvas-bg"></canvas>
      </div>
    );
  }
}

export default App;
