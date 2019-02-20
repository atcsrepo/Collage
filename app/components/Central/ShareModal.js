var React = require('react');
var path = require('path');

module.exports = class ShareModal extends React.Component{
  constructor(props){
    super(props);
    
    this.state = {
      address: ''    
    }
    
    this.overlayClick = this.overlayClick.bind(this);
    this.modalClick = this.modalClick.bind(this);
    this.copyInput = this.copyInput.bind(this);
  }
  
  copyInput(){
    document.querySelector('input').select();
    document.execCommand('copy');
  }
  
  overlayClick(e){
    e.stopPropagation();
    this.props.closeModal();
  }
  
  modalClick(e){
    e.stopPropagation();
  }
  
  displayRegister(){
    var display = [];
    
    return display;
  }

  componentDidMount(){
    var address = window.location.hostname + '/viewwall/' + this.props.wallID;
    this.setState({address: address});
  }
  
  render(){
    return(
      <div className='overlay' onClick={this.overlayClick}>
        <div className='sharemodal modal' onClick={this.modalClick}>
          <div className='sharemodal-main'>
            <div className='sharecode'>
              <input value={this.state.address}/>
            </div>
            <div className='copy-button' onClick={this.copyInput}>
              Copy
            </div>
          </div>
          <div className='sharemodal-footer'>
            <div className='modal-button close-modal' onClick={this.props.closeModal}>
              Close
            </div>
          </div>
        </div>
      </div>
    );
  }
}
