var React = require('react');
var Masonry = require('react-masonry-component');

module.exports = class DisplayBoard extends React.Component{
  constructor(props){
    super(props);
  
    this.state = {
      currentPanel: '',
      prevPanel: ''
    }
  
    this.generatePanels = this.generatePanels.bind(this);
    this.imgError = this.imgError.bind(this);
  }
  
  imgError(e){
    e.target.src = '/broken-image.png';
  }
  
  generatePanels(){
    return this.props.images.map((image, idx) => {
      return (
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