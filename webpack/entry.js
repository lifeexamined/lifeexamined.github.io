import React, { Component } from 'react';
import {render} from 'react-dom';
import Hello from './components/Hello';

console.log('it works!', __dirname);

class App extends Component {
  render() {
    return (
      <Hello />
      
    )
  }
}

render(<App />, document.getElementById('root'));
