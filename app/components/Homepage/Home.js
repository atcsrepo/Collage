var React = require('react');
var NavBar = require('./NavBar');
var Modal = require('./Modal');
var HomeContent = require('./HomeContent');
var Wall = require('./ViewWall');
var Footer = require('../Footer/Footer');
var socket = require('socket.io-client')();
var axios = require('axios');
require('!style-loader!css-loader!./homestyles.css');

module.exports = class Home extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {
      route: '/',
      register: false,
      login: false,
      authType: 'local',
      latestWalls: [],
      extWall: []
    }
    
    this.setLogin = this.setLogin.bind(this);
    this.setAuthType = this.setAuthType.bind(this);
    this.setRegister = this.setRegister.bind(this);
    this.setRoute = this.setRoute.bind(this);
  }
  
  setRoute(route){
    this.setState({route: route});
  }
  
  setAuthType(type){
    this.setState({authType: type});
  }
  
  setLogin(){
    this.setState({login: !this.state.login});
  }
  
  setRegister(){
    this.setState({register: !this.state.register});
  }
  
  componentDidMount(){
    socket.emit('requestWallsUpdate');
    
    socket.on('latestwalls', (data) => {
      this.setState({latestWalls: data});
    });
    
    socket.on('wallsUpdateAvailable', () => {
      socket.emit('requestWallsUpdate');
    });
    
    if(window.location.pathname){
      this.setRoute(window.location.pathname);
    } else {
      this.setRoute('/');
    }
  }
  
  render(){
    var page;
    
    switch (this.state.route) {
      case '/': 
        page = <HomeContent walls={this.state.latestWalls} changeRoute={this.setRoute} setLogin={this.setLogin}/>
        break;
      default:
        page = <Wall route={this.state.route}/>
    }
    
    return (
      <div>
        <NavBar setLogin={this.setLogin}
                setRegister={this.setRegister}
                setRoute={this.setRoute}
        />
        {
          this.state.register ?
            <Modal type='register' 
                  setRegister={this.setRegister}
                  setLogin={this.setLogin}
            /> :
            this.state.login ?
              <Modal type='login' 
                  setLogin={this.setLogin}
                  setRegister={this.setRegister}
              /> :
              null
        }
        {page}
        <Footer />
      </div>
    );
  }
}