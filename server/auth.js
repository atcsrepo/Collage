const session = require('express-session'),
      passport = require('passport'),
      GitHubStrat = require('passport-github').Strategy,
      googleStrat = require('passport-google-oauth').OAuth2Strategy,
      local = require('passport-local'),
      bcrypt = require('bcrypt'),
      ObjectId = require('mongodb').ObjectId;

module.exports = function(app, db){
  
  /*
   *Configuration settings for express-session and passport
   *Not actually configured for production
  */
  
  app.use(session({ 
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    db.collection('users').findOne({_id: new ObjectId(id)}, (err, user) => {
      done(err, user);
    });
  });
  
  //Configuration for passport-local
  
  passport.use(new local(
    function(username, password, done){
      if (username && password){
        db.collection('users').findOne({username: username}, (err, user) => {
          if (err) {return done(err);}
          
          if(!user){
            return done(null, false, {message: 'Invalid username.'});
          }

          bcrypt.compare(password, user.password, (err, result) => {
            if(!result){
              return done(null, false, {message: 'Invalid password.'});
            } else {
              return done(null, user);
            }
          });
        });
      } else {
        return done(null, false, {message: 'Invalid login.'});
      }
    }
  ));
  
  //Configuration for Google OAuth
  
  passport.use(new googleStrat({
      clientID: process.env.GGCLIENTID,
      clientSecret: process.env.GGCLIENTSECRET,
      callbackURL: 'https://glaze-tank.glitch.me/callback/google'       
    },
    function (accessToken, refreshToken, profile, done) {
      db.collection('users').findOne({$and: [{loginType: 'google'}, {extID: profile.id}]}, (err, user) => {
        if (user) {
          return done(err, user);
        } else {
          createProfile("", "", "", 'google', profile.id, db, done);
        }
      });
    }
  ));
  
  //Configuration for Github OAuth
  
  passport.use(new GitHubStrat({
      clientID: process.env.GHCLIENTID,
      clientSecret: process.env.GHCLIENTSECRET,
      callbackURL: "https://glaze-tank.glitch.me/callback/github"
    },
    function(accessToken, refreshToken, profile, done) {
      db.collection('users').findOne({$and: [{loginType: 'github'}, {extID: profile.id}]}, (err, user) => {
        if (user) {
          return done(err, user);
        } else {
          createProfile("", "", "", 'github', profile.id, db, done);
        }
      })
    }
  ));
  
  /*
   *Route for registering local account
   *Performs username and e-mail check prior to hashing password and creating initial user profile and logging in
  */
  
  app.route('/register')
    .post((req, res, next) => {
      
      //Local account creation
      
      var username = req.body.username,
          email = req.body.email,
          password = req.body.password;

      db.collection('users').find(
        {
          $or: [
            {username: username},
            {email: email}
          ]
        }).toArray((err, users) => {
          if (err) throw err;
       
          if (users.length) {
            for (var i = 0; i < users.length; i++){
              var user = users[i];
    
              if(user.username === username){
                res.writeHead(200, {"Content-type": "text/plain"});
                res.end('Username in use.');
              } else if (user.email === email){
                res.writeHead(200, {"Content-type": "text/plain"});
                res.end('E-mail in use.');
              }
            }
          } else {
            createProfile(username, password, email, "local", "", db, next);
          }
        });
    }, (req, res, next) => {
      
      //Account login
      
      passport.authenticate('local', function(err, user, info) {
        if(err) {return next(err);}
        
        if(!user) {
          res.writeHead(200, {"Content-type": "application/JSON"});
          return res.end(JSON.stringify(info));
        }
        
        req.logIn(user, function(err) {
          if (err) {return next(err);}
          res.writeHead(200, {"Content-type": "application/JSON"});
          return res.end(JSON.stringify({redirect: '/central/mywall'}));
        });
      })(req, res, next);
    });
  
  //Route use for log in
  
  app.route('/login')
    .post((req, res, next) => {
      passport.authenticate('local', function(err, user, info) {
        if(err) {return next(err);}
        
        if(!user) {
          res.writeHead(200, {"Content-type": "application/JSON"});
          return res.end(JSON.stringify(info));
        }

        req.logIn(user, function(err) {
          if (err) {return next(err);}
          res.writeHead(200, {"Content-type": "application/JSON"});
          return res.end(JSON.stringify({redirect: '/central/mywall'}));
        });
      })(req, res, next);
    })
  
  //Route used for Google OAuth and callback
  app.get(
    '/extlogin/google',
    passport.authenticate(
      'google', 
      { scope: ['https://www.googleapis.com/auth/plus.login']}
    )
  );
  
  app.get(
    '/callback/google', 
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/central/mywall');
    }
  );
  
  //Route used for GitHub OAuth and callback
  
  app.get(
    '/extlogin/github',
    passport.authenticate(
      'github', 
      { scope: ['user:email'] }
    )
  );
  
  app.get(
    '/callback/github', 
    passport.authenticate('github', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/central/mywall');
    }
  );
}

/*
 *Function to create basic account from OAuth login
 **loginType is the service/OAuth provider
 **id is from OAuth profile
 **db is used to insert into mongodb
 **done is callback provided by passport-oauth login to pass control/info
 *Includes possibility of adding in local username/password post login
 */
//createProfile(username, password, email, loginType, id, db, done)
function createProfile(username, password, email, loginType, id, db, done){
  var wallID = (Date.now().toString(36) 
                + Math.random().toString(36).substr(2,5))
                .toUpperCase();
  
  bcrypt.hash(password, 8, (err, hash) => {
    if (err) throw err;
    
    var profile = {};
    profile.username = username;
    profile.extID = id;
    profile.loginType = loginType;
    profile.email = email;
    profile.password = hash;
    profile.walls = [{
      wallNum: 1,
      wallID: wallID,
      imageLinks: [],
      lastUpdated: ''
    }];
        
    db.collection('users').insert(profile, (err, result) => {
      if (err) throw err;
      
      if (loginType === "local") {
        return done()
      } else {
        db.collection('users').findOne(
          {$and: [{loginType: loginType}, {extID: id}]}, 
          (err, user) => {
            if(err) throw err;
            return done(err, user);
          }
        );
      }
    });
  });
}