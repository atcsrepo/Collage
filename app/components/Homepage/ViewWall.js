var React = require('react');
var DisplayBoard = require('./DisplayBoard');
var axios = require('axios');

module.exports = class MyWalls extends React.Component{
  constructor(props){
    super(props);
    
    this.state = {
      wallImages: []
    }
    
    this.setModal = this.setModal.bind(this);
  }
  
  setModal(){
    this.setState({modal: !this.state.modal});
  }
  
  componentDidMount(){
    history.pushState(null, null, this.props.route);
    
    var wallID = /^\/viewwall\/(.*)/.exec(this.props.route)[1]
      
    axios.get('/reqwall/' + wallID)
    .then((response) => {
      this.setState({wallImages: response.data.imageLinks});
    })
    .catch((error) => {
      console.log(error);
    })
  }
  
  render(){
    return(
      <div className='mainpage-setup'>
        <div className='wall-holder'>
          <div id='mywallarea'>
            <div id='mywall-display'>
              <DisplayBoard images={this.state.wallImages}/>
            </div>
            <div id='mywall-footer'>
            </div>
          </div>
        </div>
      </div>
    );
  }
}