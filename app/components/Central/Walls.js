var React = require('react');
var Masonry = require('react-masonry-component');
var axios = require('axios');

module.exports = class Walls extends React.Component{
  constructor(props){
    super(props);
  
    this.state = {
      tabOpen: false,
    }
  
    this.createMiniWalls = this.createMiniWalls.bind(this);
    this.fillViewArea = this.fillViewArea.bind(this);
    this.viewPanel = this.viewPanel.bind(this);
    this.setTab = this.setTab.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.imgError = this.imgError.bind(this);
  }
  
  imgError(e){
    e.target.src = '/broken-image.png';
  }
  
  setTab(){
    this.setState({tabOpen: !this.state.tabOpen}, () => {
      toggleOpenTab();
    })
  }
  
  viewPanel(e){
    var wallID = e.currentTarget.id,
        address = '/viewwall/' + wallID;
    
    this.props.changeRoute(address);
  }
  
  handleTabClick(){
    this.setTab();
  }
  
  createMiniWalls(){
    var walls = this.props.walls,
        panels = [];
  
    for (var i = 0; i < walls.length; i++){
      var wall = walls[i];

      panels.push(
        <div className='miniDisplay-frame' key={'mdisplay' + i}>
          <div className='miniDisplay-viewArea' 
            id={wall.wall.wallID} 
            onClick={this.viewPanel}>
            <Masonry className='mini-gallery'>
              {this.fillViewArea(wall.wall.imageLinks, wall.wallID)}
            </Masonry>
          </div>
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
          <img src={linksArray[i]} onError={this.imgError} className='miniImage'/>
        </div>
      );
    }
    
    return processedImages;
  }
  
  render(){
    return (
      <div className='wallsTab'>
        <div className='displayTab' onClick={this.handleTabClick} id='display-tab-div'>
          {
            this.state.tabOpen ? 
              'Close Tab' :
              'New Updates'
          }
        </div>
        <div className='miniPanelsArea' id='miniDisplayArea'>
          {this.createMiniWalls()}
        </div>
      </div>
    );
  }
}

function toggleOpenTab(){
  var targetClass = document.getElementById('miniDisplayArea').className;

  if(/(^|\s)opentab-class($|\s)/.test(targetClass)){
    document.getElementById("miniDisplayArea").className = document.getElementById("miniDisplayArea").className.replace(/(?:^|\s)opentab-class(?!\S)/g , '')
  } else {
    document.getElementById("miniDisplayArea").className += ' opentab-class'
  }
}