var React = require('react');
require('!style-loader!css-loader!./homestyles.css');

module.exports = class NavBar extends React.Component {
  constructor(props){
    super(props);
    
    this.route = this.route.bind(this);
    this.auth = this.auth.bind(this);
  }
  
  route(e){
    var id = e.target.id;
    this.props.setRoute(id);
    
    history.replaceState({}, "Home", '/');
  }
  
  auth(e){
    var id= e.target.id;
    
    if (id === 'login'){
      this.props.setLogin();
    } else {
      this.props.setRegister();
    }
  }
  
  render(){
    return( 
      <div className='navbar'>
        
        <div className='nav-div'>
          <div className='nav-item'>Collage</div>
          <div className='nav-item linkable' onClick={this.route} id='/'>
            Home
          </div>
        </div>
       
        <div className='nav-div'>
          <div className='nav-item linkable' onClick={this.auth} id='login'>
            Login
          </div>
          <div className='nav-item linkable' onClick={this.auth} id='register'>
            Register
          </div>
        </div>
        
      </div>
    );
  }
}