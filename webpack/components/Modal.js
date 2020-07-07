import React, { Component } from 'react';

class Modal extends React.Component {
    constructor(props){
      super(props)
  
    }
  
      render(){
        if(!this.props.show){
          return null;
        }
        return <div>{this.props.children}</div>;
      }
    }
  
    class CardProps extends React.Component {
      constructor(props){
      super(props)
      this.state = {
        properties: cardObj.properties,
        property: cardObj.properties[0]
      }
    }
  
    currentProperty = e => {
    const clickedImg = e.target.id;
    this.setState({
      property: cardObj.properties[clickedImg]
    })
  }
  
  nextProperty = () => {
    const newIndex = (this.state.property.index-1)+1;
    this.setState({
      property: cardObj.properties[newIndex]
    })
  }
  
  prevProperty = () => {
    const newIndex = (this.state.property.index-1)-1;
    this.setState({
      property: cardObj.properties[newIndex]
    })
  }
  
      state = {
      show: false,
      };
  
      showModal = e => {
      this.setState({
        show: !this.state.show,
        property: cardObj.properties[e.target.id]
      });
      };
  
      closeModal = e => {
      this.setState({
        show: !this.state.show,
      });
      };
  
      onClose = e => {
        this.props.onClose && this.props.onClose(e);
       };
  
       render(){
    const {properties, property} = this.state
        return(
          <div>
          <Modal onClose={this.showModal} show={this.state.show}> 
          <div class="background" style={backgroundStyle}>
            <a onClick={e => {this.closeModal(e);}} class="close-gallery" style={closeGalleryStyle}>X</a>
            <button class="fa fa-chevron-circle-left" style={buttonStyle} onClick={e => {this.prevProperty(); console.log(this.state.property.index)}} disabled={property.index === 1}></button>
          <div class="card-wrapper" style={cardWrapperStyle}>
            <div class="card" style={cardStyle}>
              <CardSliderThing cardprop={this.props.cardprop} dataindex={this.props.dataindex} property={property} />
              </div>
              
              </div>
              <button style={buttonStyle} class="fa fa-chevron-circle-right" onClick={e => {this.nextProperty(); console.log(this.state.property.index)}} disabled={property.index === cardObj.properties.length}></button>
            </div>
        </Modal>
          <a onClick={e => {this.showModal(e); console.log(e.target.id);}}><img id={this.props.id} src={this.props.cardminiimg} /></a>
          </div>
        )
      }
  
    }
    
    
   const CardSliderThing = ({property}) => {
  
  const { index, path } = property;
  
    return(
  
      <div style={subCardStyle}>
    <div class="card-photo" style={cardPhotoStyle}>
                <img src={path} style={imgStyle} />
              </div>
              <div class="count" style={countStyle}>{index}/{% for myimage in image_files %}{% assign numberTotal = forloop.length %}{% if forloop.first == true %}{{ numberTotal }}{% break %}{% endif %}{% endfor %}</div>
              </div>
  
    )
  }

  export default Modal;
  export default CardProps;
  export default CardSliderThing;