let bcrypt = require('bcrypt');

module.exports = (app, db) => {
  
  /*
   *Route used to update username
   **Checks if user is authenticated
   **Generates db search query depending on whether user used a local or external (OAuth) login
   **Confirms username is available, else responds with error message
   **If available, update in db and send confirmation response
  */
   
  app.route('/updateusername')
    .post((req, res) => {
      if(req.isAuthenticated()){
        let newUsername = req.body.newUsername,
            query;
        
        if(req.user.loginType != 'local'){
          query = {$and: [{loginType: req.user.loginType}, {extID: req.user.extID}]};
        } else {
          query = {username: req.user.username};
        }

        db.collection('users').findOne({username: newUsername}, (err, user) => {
          if(err) throw err;

          if(user){
            res.writeHead(200, {"Content-type": "application/JSON"});
            res.end(JSON.stringify({message: 'Username in use.'}));
          } else {
            db.collection('users').update(
              query,
              {$set: {username: newUsername}},
              (err, result) => {
                if (err) throw err;
                res.writeHead(200, {"Content-type": "application/JSON"});
                res.end(JSON.stringify({message: "Username changed."}));
            });
          }
        });
      }
    });
  
  /*
   *Route used to update password
   **Generates db search query depending on whether user used a local or external (OAuth) login
   **Searches for user and:
   ***Checks submitted password against password in db => sends error message if it does not match
   ***User should leave old password blank if changing password for first time after logging in with OAuth
   ***If matching, checks new password and confirmation to make sure it matches, else send error message
   ****Finally, adds to db and sends out success message
  */
  
  app.route('/updatepassword')
    .post((req, res) => {
      if(req.isAuthenticated()) {

        let oldpassword = req.body.oldpassword,
            newpassword1 = req.body.newpassword1,
            newpassword2 = req.body.newpassword2,
            query;
        
        if(req.user.loginType != 'local'){
          query = {$and: [{loginType: req.user.loginType}, {extID: req.user.extID}]};
        } else {
          query = {username: req.user.username};
        }
        
        db.collection('users').findOne(query, (err, user) => {
          bcrypt.compare(oldpassword, user.password, (err, result) => {

            if(!result){
              res.writeHead(200, {"Content-type": "application/JSON"});
              res.end(JSON.stringify({message: "Incorrect password."}));
            } else {
              if (newpassword1 !== newpassword2) {
                res.writeHead(200, {"Content-type": "application/JSON"});
                res.end(JSON.stringify({message: "Please re-confirm password."}));
              } else {
                bcrypt.hash(newpassword1, 8, (err, hash) => {
                  db.collection('users').update(
                    query,
                    {$set: {password: hash}},
                    (err, result) => {
                      console.log(result.result, 'whore cares')
                      res.writeHead(200, {"Content-type": "application/JSON"});
                      res.end(JSON.stringify({message: "Password Updated."}));
                    });
                });
              }
            }
          });
        });
      }
    });
}