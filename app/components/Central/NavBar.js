var React = require('react');
var axios = require('axios');
require('!style-loader!css-loader!./centralstyles.css');

module.exports = class NavBar extends React.Component {
  constructor(props){
    super(props);
    
    this.route = this.route.bind(this);
    this.logout = this.logout.bind(this);
  }
  
  route(e){
    var id = e.target.id;
    
    this.props.setRoute(id);
    history.replaceState({}, "MyWall", '/central/mywall');
  }
  
  logout(){
    axios.get('/logout')
      .then((response) => {
        window.location.replace(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
  }
  
  render(){
    return( 
      <div className='navbar'>
        <div className='nav-div'>
          <div className='nav-item'>Collage</div>
        </div>

        <div className='nav-div'>
          <div className='nav-item linkable' onClick={this.route} id='/central/mywall'>
            My Wall
          </div>
          <div className='nav-item linkable' onClick={this.props.openSettings} id='/settings'>
            Settings
          </div>
          <div className='nav-item linkable' onClick={this.logout}>
            Logout
          </div>
        </div>
      </div>
    );
  }
}