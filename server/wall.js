let fs = require('fs');

module.exports = (app, db) =>{
  //Plays around with combining socket with http requests

  /*
   *Main page post login. 
   *Displays user wall and allows users to add/del images from wall
  */
   
  app.route('/central/mywall')
    .get((req, res) => {
      if (req.isAuthenticated()){
        fs.readFile('./build/center.html', (err, data) => {
          res.writeHead(200, {"Content-type": "text/html"});
          res.end(data);
        })
      } else {
        res.redirect('/');
      }
    });
  
  /*
   *Gets image links and wallID for user wall
  */
   
  app.route('/getmywallimages')
    .get((req, res) => {
      if(req.isAuthenticated()){
        let routeIO = app.get('socketio'),
            query;
        
        if(req.user.loginType != 'local'){
          query = {$and: [{loginType: req.user.loginType}, {extID: req.user.extID}]};
        } else {
          query = {username: req.user.username};
        }

        db.collection('users').findOne(query, (err, user) => {
          routeIO.emit('mywall', {imageLinks: user.walls[0].imageLinks});
          routeIO.emit('wallID', {wallID: user.walls[0].wallID});
        });
      } else {
        res.writeHead(200, {"Content-type": "application/JSON"});
        res.end(JSON.stringify({error: 'User not logged in.', redirect: '/'}));
      }
    });
  
  /*
   *Route for adding images to user wall
   *Checks for authentication before adding image
   *Updates wall collection (Used to display latest walls that have been updated) and user imageLinks
   *Following addition of image, uses socketio to emit new images and latest walls to connected clients
  */
   
  app.route('/addimg')
    .post((req, res) => {
      if(req.isAuthenticated()){
        let routeIO = app.get('socketio'),
            link = req.body.link,
            username = req.user.username,
            query;
        
        if(req.user.loginType != 'local'){
          query = {$and: [{loginType: req.user.loginType}, {extID: req.user.extID}], 'walls.wallNum': 1};
        } else {
          query = {username: req.user.username, 'walls.wallNum': 1};
        }
       
        db.collection('users').update(
          query, 
          {
            $push: 
              {
                'walls.$.imageLinks': link
              },
            $set:
              {
                'walls.$.lastUpdated': Date.now()
              }
          }, (err, result) => {
            res.writeHead(200, {"Content-type": "application/JSON"});
            res.end(JSON.stringify({resetValue: ''}));
          
            db.collection('users').findOne(query, (err, user) => {
              let wallID = user.walls[0].wallID,
                  wall = user.walls[0];
            
              db.collection('walls').update({'wall.wallID': wallID}, {wall}, {upsert: true}, (err, result) => {
                routeIO.emit('wallsUpdateAvailable');
                routeIO.emit('mywall', {imageLinks: user.walls[0].imageLinks});
              });
            });
          }
        );
      } else {
        res.writeHead(200, {"Content-type": "application/JSON"});
        res.end(JSON.stringify({error: 'Please login', redirect: '/'}));
      }
    });
  
  /*
   *Route for deleting images from user wall
   *Checks for authentication before deleting image
   *Updates wall collection (Used to display latest walls that have been updated) and user imageLinks
   *Following deletion of image, uses socketio to emit new images and latest walls to connected clients
  */
   
  app.route('/delimg')
    .post((req, res) => {
      if (req.isAuthenticated()){
        let routeIO = app.get('socketio'),
            link = req.body.link,
            query;
        
        if(req.user.loginType != 'local'){
          query = {$and: [{loginType: req.user.loginType}, {extID: req.user.extID}], 'walls.wallNum': 1};
        } else {
          query = {username: req.user.username, 'walls.wallNum': 1};
        }
        
        db.collection('users').update(
          query, 
          {
            $pull: {
              'walls.$.imageLinks': link
            },
            $set: {
              'walls.$.lastUpdated': Date.now()
            }
          }, (err, result) => {
            if (err) throw err;
            
            db.collection('users').findOne(query, (err, user) => {
              let wallID = user.walls[0].wallID,
                  wall = user.walls[0];
              
              db.collection('walls').update({'wall.wallID': wallID}, {wall}, {upsert: true},(err, result) => {
                routeIO.emit('wallsUpdateAvailable');
                routeIO.emit('mywall', {imageLinks: user.walls[0].imageLinks});
              });
              
              res.writeHead(200, {"Content-type": "application/JSON"});
              res.end(JSON.stringify({status: 'updated'}));
            });
          }
        );
      } else {
        res.end();
      }
    });
 
  /*
   *Used to delete all image links from user wall, before sending out update via socketio
  */
 
  app.route('/clearboard/:wallid')
    .get((req, res) => {
      if(req.isAuthenticated()){
        let routeIO = app.get('socketio'),
            query;
        
        if(req.user.loginType != 'local'){
          query = {$and: [{loginType: req.user.loginType}, {extID: req.user.extID}], 'walls.wallNum': 1};
        } else {
          query = {username: req.user.username, 'walls.wallNum': 1};
        }
        
        db.collection('users').update(
          query,
          {$set: {'walls.0.imageLinks': []}},
          (err, user) => {
            if (err) throw err;
            
            db.collection('walls').remove(
              {'wall.wallID': req.params.wallid},
              (err, result) => {
                if (err) throw err;
                
                routeIO.emit('wallsUpdateAvailable');
              });
            
            db.collection('users').findOne(query, (err, user) => {
              routeIO.emit('mywall', {imageLinks: user.walls[0].imageLinks});
            });
        });
      }
      res.end();
    });
  
  /*
   *Provides the content/image links for walls that use the /viewwall route
  */
   
  app.route('/reqwall/:id')
    .get((req, res) => {
      console.log('is this used?')
      db.collection('walls').findOne({'wall.wallID': req.params.id}, (err, wall) => {
        if (err) throw err;
        
        var imageLinks = wall.wall.imageLinks;
        
        res.writeHead(200, {"Content-type": "application/JSON"});
        res.end(JSON.stringify({imageLinks}));
      });
    });
  
  /*
   *Distinguishes between logged in and non-logged in users and directs users to the appropriate page
   *Used for viewing walls obtained through shareable link or though clicking recent updates
  */  
  
  app.route('/viewwall/:id')
    .get((req, res) => {
      if (req.isAuthenticated()){
        fs.readFile('./build/center.html', (err, data) => {
          res.writeHead(200, {"Content-type": "text/html"});
          res.end(data);
        });
      } else {
        fs.readFile('./build/index.html', (err, data) => {
          res.writeHead(200, {"Content-type": "text/html"});
          res.end(data);
        });
      }
    });
}