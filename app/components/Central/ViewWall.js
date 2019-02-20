var React = require('react');
var DisplayBoard = require('./DisplayBoard');
var AddModal = require('./AddModal');
var ShareModal = require('./ShareModal');
var axios = require('axios');

module.exports = class ViewWalls extends React.Component{
  constructor(props){
    super(props);
    
    this.state = {
      addmodal: false,
      sharemodal: false
    }
    
    this.setAdd = this.setAdd.bind(this);
    this.setShare = this.setShare.bind(this);
    this.clearBoard = this.clearBoard.bind(this);
  }
  
  setAdd(){
    this.setState({addmodal: !this.state.addmodal});
  }
  
  setShare(){
    this.setState({sharemodal: !this.state.sharemodal});
  }

  clearBoard(){
    axios.get('/clearboard/' + this.props.wallID)
      .then((response) => {
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
              <DisplayBoard images={this.props.wallImages} mywall={this.props.mywall}/>
            </div>
           
            {
              this.props.mywall ?
               <div id='mywall-footer'>
                <div className='modal-button share-wall-button' onClick={this.setShare}>
                  + Share Link
                </div>
                <div className='modal-button add-image-button' onClick={this.setAdd}>
                  + Add Image
                </div>
                <div className='modal-button clear-board-button' onClick={this.clearBoard}>
                  - Clear Board
                </div>
              </div> :
              <div id='mywall-footer'/>
            }  
          
            {this.state.addmodal ? <AddModal closeModal={this.setAdd} />: null}
            {this.state.sharemodal ? <ShareModal closeModal={this.setShare} wallID={this.props.wallID}/>: null}
            
          </div>
        </div>
        <div className='ghost-placeholder' />
      </div>
    );
  }
}