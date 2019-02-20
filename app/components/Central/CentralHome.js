var React = require('react');
var NavBar = require('./NavBar');
var Wall = require('./ViewWall');
var Walls = require('./Walls');
var Footer = require('../Footer/Footer');
var SettingModal = require('./Settings');
var Notifications = require('./Notifications');
var axios = require('axios');
require('!style-loader!css-loader!./centralstyles.css');

module.exports = class Home extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {
      route: '/central/mywall',
      myimages: [],
      latestWalls: [],
      extWall: [],
      settings: false,
      wallID: ''
    }
 
    this.setRoute = this.setRoute.bind(this);
    this.openSettings = this.openSettings.bind(this);
    this.getMyWall = this.getMyWall.bind(this);
    this.getLatestWalls = this.getLatestWalls.bind(this);
    this.setWallID = this.setWallID.bind(this);
  }
  
  setWallID(id){
    this.setState({wallID: id});
  }
  
  setRoute(route){
    this.setState({route: route}, () => {
      if (/^\/viewwall\/(.*)/.test(this.state.route)) {
        history.replaceState(null, null, this.state.route);

        var wallID = /^\/viewwall\/(.*)/.exec(this.state.route)[1];
      
        axios.get('/reqwall/' + wallID)
        .then((response) => {
          this.setState({extWall: response.data.imageLinks});
        })
        .catch((error) => {
          console.log(error);
        });
      }
    });
  }
  
  openSettings(){
    this.setState({settings: !this.state.settings});
  }
  
  getMyWall(wall){
    this.setState({myimages: wall});
  }
  
  getLatestWalls(walls){
    this.setState({latestWalls: walls});
  }
  
  componentDidMount(){
    this.setRoute(window.location.pathname);
  }
  
  render(){
    var page;
    
    switch(this.state.route){
      case '/central/mywall':
        page = <Wall mywall={true} wallImages={this.state.myimages} wallID={this.state.wallID}/>
        break;
      default:
        page = <Wall mywall={false} wallImages={this.state.extWall}/>
        break;
    }

    return (
      <div>
        <NavBar authenticated='true' 
                openSettings={this.openSettings}
                setRoute={this.setRoute}
        />
        {page}
        {
          this.state.settings?
            <SettingModal closeModal={this.openSettings}/> :
            null
        }
        <Walls walls={this.state.latestWalls} changeRoute={this.setRoute} />
        <Notifications getMyWall={this.getMyWall}
                       getLatestWalls={this.getLatestWalls}
                       getWallID={this.setWallID}/>
        <Footer />
      </div>
    );
  }
}