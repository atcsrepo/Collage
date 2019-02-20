var React = require('react');
var axios = require('axios');

module.exports = class AddModal extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {
      imageURL: '',
      queryURL: '',
      search: false
    }
    
    this.handleInputChange = this.handleInputChange.bind(this);
    this.getImg = this.getImg.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.modalClick= this.modalClick.bind(this);
    this.overlayClick = this.overlayClick.bind(this);
    this.displayImage = this.displayImage.bind(this);
    this.imgError = this.imgError.bind(this);
    this.submitUrl = this.submitUrl.bind(this);
  }
  
  overlayClick(e){
    this.props.closeModal();
    e.stopPropagation();
  }
  
  modalClick(e){
    e.stopPropagation();
  }
  
  handleInputChange(e){
    var val = e.target.value;
    this.setState({imageURL: val});
  }
  
  getImg(){
    this.setState({search: true, queryURL: this.state.imageURL}, () => {
      this.setState({search: false})
    })
  }
  
  handleKey(e){
    if (e.key === 'Enter'){
      this.getImg()
    }
  }
  
  displayImage(){
    if(this.state.queryURL){
      return <img src={this.state.queryURL} onError={this.imgError} id='displayImage'/> 
    }
  }
  
  imgError(e){
    e.target.src ='/broken-image.png';
  }
  
  submitUrl(){
    axios.post('/addimg/', {link: this.state.queryURL})
      .then((res) => {
        console.log(res, 'in add')
        this.setState({imageURL: res.data.resetValue})
      })
      .catch((error) => {
        console.log(error)
      })
  }
  
  render(){
    return(
      <div className='overlay' onClick={this.overlayClick}>
        <div id='addModal' className='modal' onClick={this.modalClick}>
          <div id='addModal-head'>
            <div id='addModal-title'>
              New Image Search
            </div>
          </div>
          <div id='addModal-body'>
            <div id='preview-display'>
              {this.displayImage()}
            </div>
            <div id='search-input-div'>
              <input placeholder='Enter Image URL' id='imageurl' 
                onChange={this.handleInputChange}
                onKeyPress={this.handleKey}
                onBlur={this.getImg}
                value={this.state.imageURL}/>
            </div>
            <div className='search-button' onClick={this.getImg}>
              Search
            </div>
          </div>
          <div id='add-modal-footer'>
            <div className='modal-button add-image-button' onClick={this.submitUrl}>
              Add Image
            </div>
            <div className='modal-button close-modal' onClick={this.props.closeModal}>
              Close
            </div>
          </div>
        </div>
      </div>
    )
  }
}