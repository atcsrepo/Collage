var React = require('react');
var Masonry = require('react-masonry-component');
var axios = require('axios');

module.exports = class Walls extends React.Component{
  constructor(props){
    super(props);
  
    this.state = {
      tabOpen: false,
      number: 0
    }
  
    this.createMiniWalls = this.createMiniWalls.bind(this);
    this.fillViewArea = this.fillViewArea.bind(this);
    this.viewPanel = this.viewPanel.bind(this);
    this.imgError = this.imgError.bind(this);
    this.updateNumber = this.updateNumber.bind(this);
  }
  
  viewPanel(e){
    var wallID = e.currentTarget.id;
    var address = '/viewwall/' + wallID;
    
    this.props.changeRoute(address);
  }
  
  imgError(e){
    e.target.src = '/broken-image.png';
  }
  
  createMiniWalls(){
    var walls = this.props.walls,
        panels = [],
        number = walls.length < this.state.number ? walls.length : this.state.number;

    if (!walls.length){
      return;
    }

    for (var i = 0; i < number; i++){
      var wall = walls[i];

      panels.push(
        <div className='miniDisplay-frame' key={'mdisplay' + i}>
          <div className='miniDisplay-viewArea' 
            id={wall.wall.wallID} 
            onClick={this.viewPanel}>
            <Masonry>
              {this.fillViewArea(wall.wall.imageLinks, wall.wallID)}
            </Masonry>
          </div>
        </div>
      );
    }
    
    for (var j = 0; j < 4; j++){
      panels.push(
        <div className='ghostframe' key={'ghost' + j}>
        </div>
      );
    }
    
    return panels;
  }
  
  fillViewArea(linksArray, ID){
    var processedImages=[];
    
    for (var i = 0; i < linksArray.length; i++){
      processedImages.push(
        <div className='miniImage-div' key={'miniImg' + ID + i}>
          <img src={linksArray[i]} className='miniImage' onError={this.imgError}/>
        </div>
      );
    }
    
    return processedImages;
  }
  
  updateNumber(){
    let number = 10;
    
    if (document.documentElement.clientWidth > 950 && document.documentElement.clientWidth < 1280) {
      number = 9;
    } else if (document.documentElement.clientWidth >= 1280) {
      number = 8;
    }
    
    if (number !== this.state.number){
      this.setState({number: number});
    }
  }
  
  componentDidMount(){
    this.updateNumber();
    
    window.addEventListener("resize", this.updateNumber);
  }
  
  componentWillUnmount(){
    window.removeEventListener("resize", this.updateNumber)
  }
  
  render(){
    return (
      <div className='wallsTab'>
        <div className='mini-panels-area' id='miniDisplayArea'>
          {this.createMiniWalls()}
        </div>
      </div>
    );
  }
}