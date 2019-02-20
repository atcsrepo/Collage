var React = require('react');
var Masonry = require('react-masonry-component');
var axios = require('axios');

module.exports = class DisplayBoard extends React.Component{
  constructor(props){
    super(props);
  
    this.state = {
      currentPanel: '',
      prevPanel: '',
      enter: false
    }
  
    this.generatePanels = this.generatePanels.bind(this);
    this.mouseEnter = this.mouseEnter.bind(this);
    this.mouseLeave = this.mouseLeave.bind(this);
    this.delImage = this.delImage.bind(this);
    this.imgError = this.imgError.bind(this);
  }
  
  imgError(e){
    e.target.src = '/broken-image.png';
  }
  
  mouseEnter(e){
    var id = e.target.id,
        targetButton;

    if (/^del/.test(id)){
      targetButton = id;
    } else {
      targetButton = 'del' + id;
    }
    
    this.setState({enter: true,currentPanel: targetButton}, () => {
      toggleClass(this.state.currentPanel);
    });
  }
  
  mouseLeave(e){
    if(this.state.enter){
      this.setState({prevPanel: this.state.currentPanel, enter: false}, () => {
        toggleClass(this.state.prevPanel);
      });
    }
  }
  
  delImage(e){
    var divID = e.target.id
    var id = /^delimage(.*)/.exec(divID);
    
    id = this.props.images[id[1]];
        
    axios.post('/delimg', {
        link: id
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      })
  }
  
  generatePanels(){
    return this.props.images.map((image, idx) => {
      return (
        this.props.mywall 
        ?
          <div
            onMouseEnter={this.mouseEnter}
            onMouseLeave={this.mouseLeave}
            className='image-div-class' 
            key={'displayDivKey' + idx}
          >
            <div
              onClick={this.delImage}
              className='image-del-button' 
              id={'delimage' + idx}>
              X
            </div>
            <img src={image} 
              className='image-element-class' 
              onError={this.imgError}
              id={'image' + idx} /
            >
          </div> 
        :
          <div
            className='image-div-class' 
            key={'displayDivKey' + idx}
          >
            <img src={image} 
              className='image-element-class'
              onError={this.imgError}
              id={'image' + idx} /
            >
          </div> 
      );
    });
  }
  
  render(){
    return(
      <Masonry
        className='my-gallery-class'
      >
        {this.generatePanels()}
      </Masonry>
    );
  }
}

function toggleClass(target){
  if(/(?:^|\s)active-panel(?!\S)/.test(document.getElementById(target).className)){
    document.getElementById(target).className = document.getElementById(target).className.replace(/(?:^|\s)active-panel(?!\S)/g, '');
  } else {
    document.getElementById(target).className += ' active-panel';
  }
}