import React, { Component } from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import Gallery from "./components/Gallery";

// change Swipe.js options by query params
class PhotoGallery extends React.Component {
  render() {
    return (
      <div className="center">
        <Gallery />
      </div>
    );
  }
}

ReactDOM.render(<PhotoGallery />, document.getElementById("root"));
