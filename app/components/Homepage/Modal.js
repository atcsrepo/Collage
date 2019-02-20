var React = require('react');
var axios = require('axios');

module.exports = class Modal extends React.Component{
  constructor(props){
    super(props);
    
    this.state = {
      error: ''
    }
    
    this.closeModal = this.closeModal.bind(this);
    this.modalClick = this.modalClick.bind(this);
    this.displayRegister = this.displayRegister.bind(this);
    this.displayLogin = this.displayLogin.bind(this);
    this.displayModalHead = this.displayModalHead.bind(this);
    this.switchAuth = this.switchAuth.bind(this);
    this.submit = this.submit.bind(this);
  }
  
  closeModal(e){
    e.stopPropagation();
    this.setState({error: ''});
    if(this.props.type === 'register'){
      this.props.setRegister();
    } else {
      this.props.setLogin();
    }
  }
  
  modalClick(e){
    e.stopPropagation();
  }
  
  switchAuth(){
    this.props.setRegister();
    this.props.setLogin();
    this.setState({error: ''});
  }
  
  submit(){
    if(this.props.type === 'register'){
      axios.post('/register', {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      })
        .then((response) => {
          if (response.data.redirect){
            window.location.replace(response.data.redirect);
          } else {
            this.setState({error: response.data});
          }
        })
        .catch((error) => {
          console.log(error);
        })
    } else {
      axios.post('/login', {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
      })
        .then((response) => {
          if (response.data.redirect){
            window.location.replace(response.data.redirect);
          } else {
            var message = response.data.message;
            this.setState({error: response.data.message})
          }
        })
        .catch((error) => {
          console.log(error);
        })
    }
  }

  displayModalHead(){
    if(this.props.type === 'register'){
      return(
        <div>
          <div className='title-option active-op' id='modalReg'>
            Register
          </div>
          <div className='title-option' id='modalLog' onClick={this.switchAuth}>
            Log In
          </div>
        </div>
      );
    } else {
      return(
        <div>
          <div className='title-option' id='modalReg' onClick={this.switchAuth}>
            Register
          </div>
          <div className='title-option active-op' id='modalLog'>
            Log In
          </div>
        </div>
      );
    }
  }
  
  displayRegister(){
    return(
      <div key='registrationForm' className='modal-form'>
        <table>
          <tbody>
            <tr>
              <td className='input-label'>
                Username:
              </td>
              <td>
                <input id='username'/>
              </td>
            </tr>
            <tr>
              <td className='input-label'>
                E-mail:
              </td>
              <td>
                <input id='email'/>
              </td>
            </tr>
            <tr>
              <td className='input-label'>
                Password:
              </td>
              <td>
                <input  type='password' id='password'/>
              </td>
            </tr>
          </tbody>
        </table>
        {
          this.state.error ? 
            <div className='modal-text'>{this.state.error}</div>:
            null
        }
      </div>
    );
  }
  
  displayLogin(){   
    return(
      <div>
        <div key='loginForm' className='modal-form'>
          <table>
            <thead>
              <tr style={{color:'white'}}>
                <th colSpan='2'>Please sign in below:</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='input-label'>
                  Username:
                </td>
                <td>
                  <input id='username'/>
                </td>
              </tr>
              <tr>
                <td className='input-label'>
                  Password:
                </td>
                <td>
                  <input type='password' id='password'/>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          {
            this.state.error ? 
              <div className='modal-text'>{this.state.error}</div>:
              null
          }
          <div className='modal-text'>
            -OR-
          </div>
          <div className='modal-text'>
            Sign in with one of the following:
          </div>
          <div className='ext-login-panel'>
            <a href='/extlogin/github'>
              <div className='ext-auth github'>
                <img src='/github_logo.png' className='logo'/>
                <div className='auth-text' onClick={this.extLogin} id='github'>GitHub</div>
              </div>
            </a>
            <a href='/extlogin/google'>
              <div className='ext-auth google'>
                <img src='/google_logo.png' className='logo' />
                <div className='auth-text' id='google'>Google</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  render(){
    return(
      <div className='overlay' onClick={this.closeModal}>
        <div className='modal' onClick={this.modalClick} id='authmodal'>
          <div className='modal-title'>
            {this.displayModalHead()}
          </div>
          <div className='modal-body'>
            {this.props.type === 'register' ? this.displayRegister() : this.displayLogin()}
          </div>
          <div className='modal-footer'>
            <div className='modal-button submit-cred' onClick={this.submit}>
              Submit
            </div>
            <div className='modal-button close-modal' onClick={this.closeModal}>
              Close
            </div>
          </div>
        </div>
      </div>
    );
  }
}