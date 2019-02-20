var React = require('react');
var axios = require('axios');

module.exports = class Modal extends React.Component{
  constructor(props){
    super(props);
    
    this.state = {
      pmsg: '',
      umsg: ''
    }
    
    this.modalClick = this.modalClick.bind(this);
    this.displayProfile = this.displayProfile.bind(this);
    this.submitPassword = this.submitPassword.bind(this);
    this.submitUsername = this.submitUsername.bind(this);
  }
  
  modalClick(e){
    e.stopPropagation();
  }
  
  submitPassword(){
    this.setState({pmsg: ''}, () => {
      axios.post('/updatepassword', {
        oldpassword: document.getElementById('oldpassword').value,
        newpassword1: document.getElementById('newpassword1').value,
        newpassword2: document.getElementById('newpassword2').value
      })
      .then((response) => {
        this.setState({pmsg: response.data.message});
      })
      .catch((error) => {
        console.log(error);
      })
    })
  }
  
  submitUsername(){
    this.setState({umsg: ''}, () => {
      axios.post('/updateusername', {
        newUsername: document.getElementById('newUsername').value,
      })
      .then((response) => {
        this.setState({umsg: response.data.message})
      })
      .catch((error) => {
        console.log(error)
      })
    });
  }
  
  displayProfile(){
    return(
      <div className='setting-body'>
        <div className='setting-block' id='update-username-block'>
          <div className='setting-title' id='update-username-text'>
            Change Password
          </div>
          <div id='update-username-info'>
            <table className='setting-table'>
              <tbody> 
                <tr>
                  <td>
                    <label className='modalLabel'>Username: </label>
                  </td>
                  <td>
                    <input id='newUsername'/>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {
            this.state.umsg ? 
              <div className='setting-msg'>{this.state.umsg}</div> :
              null
          }
          <div className='setting-submit-button' onClick={this.submitUsername} id='updateUsernameButton'>
            Update Username
          </div>
        </div>
        <div className='setting-block' id='update-password-block'>
          <div className='setting-title' id='update-password-text'>
            Change Password
          </div>
          <div id='update-password-info'>
            <div>
              <table className='setting-table'>
                <tbody> 
                  <tr>
                    <td>
                      <label className='modalLabel'>Old Password: </label>
                    </td>
                    <td>
                      <input type='password' id='oldpassword'/>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label className='modalLabel'>New Password: </label>
                    </td>
                    <td>
                      <input type='password' id='newpassword1'/>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label className='modalLabel'>Confirm Password: </label>
                    </td>
                    <td>
                      <input type='password' id='newpassword2'/>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {
            this.state.pmsg ? 
              <div className='setting-msg'>{this.state.pmsg}</div> :
              null
          }
          <div className='setting-submit-button' onClick={this.submitPassword} id='updatePasswordButton'>
            Update Password
          </div>
        </div>
      </div>
    );
  }
  
  render(){
    return(
      <div className='overlay' onClick={this.props.closeModal}>
        <div className='modal setting-modal' onClick={this.modalClick}>
          <div className='modal-title'>
            Profile
          </div>
          <div className='modal-body'>
            {this.displayProfile()}
          </div>
          <div className='modal-footer setting-footer'>
            <div className='modal-button close-modal' onClick={this.props.closeModal}>
              Close
            </div>
          </div>
        </div>
      </div>
    );
  }
}