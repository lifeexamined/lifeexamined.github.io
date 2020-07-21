import React, { Component } from "react";
import myData from './data/data';
import Carousel from "./Carousel";
import querystring from "querystring";
import ReactSwipe from "react-swipe";

const mydataproperties = myData.properties;

const query = querystring.parse(window.location.search.slice(1));

// generate slide panes
const numberOfSlides = myData.properties.length;

const imgPath = i => {
  return "https://lifeexamined.github.io/" + myData.properties[i].path;
};
const paneNodes = Array.apply(null, Array(numberOfSlides)).map((_, i) => {
  return (
    <div key={i}>
      <div className="item">
        <img src={imgPath(i)} />
      </div>
    </div>
  );
});

class Gallery extends React.Component {
  constructor(props) {
    super(props);
    this.state = { mydataproperties };
  }

  photoStart = e => {
    this.setState({
      myid: Number(e.target.id) || reactSwipeEl.getPos(),
      currentphoto: reactSwipeEl.getPos()
    });
  };

  render() {
    return (
      <div className="gallery">
        <div id="column-1" className="column">

          {Object.keys(mydataproperties).map(key => (
            <a
              key={key}
              id={mydataproperties[key].index + "yamaha"}
              onClick={e => {
                reactSwipeEl.slide(e.target.id);
                this.photoStart(e);
                console.log("elpos" + reactSwipeEl.getPos());
              }}
            >
              <img
                id={mydataproperties[key].index}
                src={
                  "https://images.weserv.nl/?url=https://lifeexamined.github.io" +
                  mydataproperties[key].path +
                  "&w=200&h=200&output=jpg&q=65"
                }
              />
            </a>
          ))}
        </div>
        <div id="column-2" className="column">

          {Object.keys(mydataproperties).map(key => (
            <a
              key={key}
              id={mydataproperties[key].index + "yamaha"}
              onClick={e => {
                reactSwipeEl.slide(e.target.id);
                this.photoStart(e);
                console.log("elpos" + reactSwipeEl.getPos());
              }}
            >
              <img
                id={mydataproperties[key].index}
                src={
                  "https://images.weserv.nl/?url=https://lifeexamined.github.io" +
                  mydataproperties[key].path +
                  "&w=200&h=200&output=jpg&q=65"
                }
              />
            </a>
          ))}
        </div>
        <div id="column-3" className="column">

          {Object.keys(mydataproperties).map(key => (
            <a
              key={key}
              id={mydataproperties[key].index + "yamaha"}
              onClick={e => {
                reactSwipeEl.slide(e.target.id);
                this.photoStart(e);
                console.log("elpos" + reactSwipeEl.getPos());
              }}
            >
              <img
                id={mydataproperties[key].index}
                src={
                  "https://images.weserv.nl/?url=https://lifeexamined.github.io" +
                  mydataproperties[key].path +
                  "&w=200&h=200&output=jpg&q=65"
                }
              />
            </a>
          ))}
        </div>
        <Carousel>
          <h1>ReactSwipe.js</h1>
          <h2>Open this page from a mobile device (real or emulated).</h2>
          <h2>
            You can pass{" "}
            <a href="https://github.com/voronianski/swipe-js-iso#config-options">
              Swipe.js options
            </a>{" "}
            as query params.
          </h2>

          <ReactSwipe
            className="mySwipe"
            swipeOptions={{
              startSlide: Number(this.state.myid),
              auto: parseInt(query.auto, 10) || 0,
              speed: parseInt(query.speed, 10) || 300,
              disableScroll: query.disableScroll === "true",
              continuous: query.continuous === "true"
            }}
            ref={el => (reactSwipeEl = el)}
          >
            {console.log(Number(this.state.myid))}
            {paneNodes}
          </ReactSwipe>
          <div className="functionality">
            <button
              onClick={e => {
                reactSwipeEl.prev();
                this.photoStart(e);
              }}
            >
              Prev
            </button>
            <div className="counter">
              {this.state.currentphoto + 1}/{myData.properties.length}
            </div>
            <button
              onClick={e => {
                reactSwipeEl.next();
                this.photoStart(e);
                console.log("myid is " + this.state.myid);
              }}
            >
              Next
            </button>
          </div>
        </Carousel>
      </div>
    );
  }
}

export default Gallery;
