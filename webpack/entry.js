import React, { Component } from 'react';
import {render} from 'react-dom';
import Gallery from './components/Gallery';

class App extends Component {
  render() {
    return (
      <Hello />
    )
  }
}

render(<Gallery />, document.getElementById('mygallery'));
