//MongoDB
let mongo = require('mongodb').MongoClient,
    mongoURL = process.env.MONGOURL;

//Generic middleware requires
let bodyParser = require('body-parser'),
    express = require('express'),
    app = express(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    url = require('url');

if (process.env.NODE_ENV === "development") {
  //Webpack and reload configurations
  let webpack = require('webpack'),
      webpackConfig = require('../webpack.config.dev.js'),
      compiler = webpack(webpackConfig),
      webpackDevMiddleware = require("webpack-dev-middleware")(
        compiler, 
        {
          noInfo: true, 
          publicPath: webpackConfig.output.publicPath
        }
      );
    
  //Setting up webpack & express-related middleware
  app.use(webpackDevMiddleware);

  app.use(require("webpack-hot-middleware")(compiler, {
    log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000
  }));
}

//Routes modules
let auth = require('./auth.js'),
    profile = require('./profile.js'),
    wall = require('./wall.js');

app.use(express.static('build'));
app.use(express.static('static'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Used for playing around with combining socket with http requests
app.set('socketio', io);

//Route logic
mongo.connect(mongoURL, (err, db) => {
  if (err) throw err;
    
  io.on('connection', (socket) => {   
    socket.emit('wallsUpdateAvailable');
    
    socket.on('requestWallsUpdate', () => {
      db.collection('walls')
      .find({})
      .sort({'wall.lastUpdated': -1})
      .limit(10)
      .toArray((err, walls) => {
        socket.emit('latestwalls', walls)
      });
    });
  });

  /*
  *Use for all authentication related routes. Includes:
  **Express-session and Passport (local, Google, Github) login configurations 
  **\/register and \/login routes 
  **OAuth login routes for Google and Github
  */
  auth(app, db);
  
  /*
   *Routes related to altering or retrieving wall images:
   *\/central/mywall: main page for displaying user wall
   *\/getmywallimages: retrieves user imageLinks
   *\/addimg: adds specified imageLink to user wall
   *\/delimg: deletes specified imageLink from user wall
   *\/clearboard: deletes all imagesLinks from user wall
   *\/reqwall: used to view walls from other users
   *\/viewwall: used to view walls from other users
   */
  wall(app, db); 
  
  /*
   *Profile related routes. Contains:
   *\/updateusername: Used to update username
   *\/updatepassword: Used to change user password
  */
  profile(app, db);
  
  app.route('/logout')
    .get((req, res) => {
      req.logout();
      
      res.writeHead(200, {"Content-type": "text/plain"});
      res.end('/');
    });
  
  app.route('*')
    .get((req, res) => {
      console.log('Path not found', req.url);
      res.end(JSON.stringify({Error: 'no content'}));
    });
  
});

server.listen(process.env.PORT, () => {
  console.log('listening on port ' + process.env.PORT);
});

