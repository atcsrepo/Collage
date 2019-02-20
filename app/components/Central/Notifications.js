var React = require('react');
var axios = require('axios');
var io = require('socket.io-client');
var socket = io();

module.exports = class Notifications extends React.Component {
  
  constructor(props){
    super(props);
  }
  
  componentDidMount(){
    
    axios.get('/getmywallimages')
      .then((response) => {
        console.log(response)
      })
    
    socket.on('wallsUpdateAvailable', () => {
      socket.emit('requestWallsUpdate');
    });
    
    socket.on('mywall', (data) => {
      this.props.getMyWall(data.imageLinks);
    });
    
    socket.on('latestwalls', (data) => {
      this.props.getLatestWalls(data);
    });
    
    socket.on('wallID', (data) => {
      this.props.getWallID(data.wallID);
    });
  }
  
  render(){
    return null;
  }
}