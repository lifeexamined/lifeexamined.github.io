import React, { Component } from "react";


class Carousel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div>{this.props.children}</div>;
  }
}

export default Carousel;