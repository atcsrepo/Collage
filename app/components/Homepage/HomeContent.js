var React = require('react');
var Walls = require('./Walls');

module.exports = class HomeContent extends React.Component{
  constructor(props){
    super(props);
  }
  
  render(){
    return (
      <div className='home-area'>
        <div className='home-banner'>
          <div className='banner-title'>
            Welcome to a Collage Maker
          </div>
          <div className='banner-text'>
            Find images to create and show off your own personal wall
          </div>
          <div className='banner-button' onClick={this.props.setLogin}>
            Get Started!
          </div>
        </div>
        <div className='minipreview-area'>
          <div className='miniprev-text'>Recently Updated Walls</div>
          <Walls walls={this.props.walls} changeRoute={this.props.changeRoute}/>
        </div>
      </div>
    );
  }
}