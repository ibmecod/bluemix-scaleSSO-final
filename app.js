/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
// slightly modified to support Single Sign On service for BLuemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// Add for SSO
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var OpenIDConnectStrategy = require('passport-idaas-openidconnect').IDaaSOIDCStrategy;
var redis = require('redis');
var RedisStore = require('connect-redis')(session);

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// create a new express server
var app = express();

// get configuration for redis backing service and connect to service
var redisConfig = appEnv.getService(/Redis.*/)
var redisPort = redisConfig.credentials.port;
var redisHost = redisConfig.credentials.hostname;
var redisPasswd = redisConfig.credentials.password;

var redisclient = redis.createClient(redisPort, redisHost, {no_ready_check: true});
redisclient.auth(redisPasswd, function (err) {
    if (err) {
      throw err;
    }
});

redisclient.on('connect', function() {
    console.log('Connected to Redis');
});

// define express session services, etc for SSO
app.use(cookieParser());
//app.use(session({resave: 'true', saveUninitialized: 'true' , secret: 'keyboard cat'}));
app.use(session({
  store: new RedisStore({ client: redisclient }),
  resave: 'true',
  saveUninitialized: 'true',
  secret: 'top secr8t'
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
   done(null, user);
});

passport.deserializeUser(function(obj, done) {
   done(null, obj);
});

// find config object for the SSO services from VCAP_SERVICES through cfenv/appEnv
var ssoConfig = appEnv.getService(/Single Sign On.*/)
var client_id = ssoConfig.credentials.clientId;
var client_secret = ssoConfig.credentials.secret;
var authorization_url = ssoConfig.credentials.authorizationEndpointUrl;
var token_url = ssoConfig.credentials.tokenEndpointUrl;
var issuer_id = ssoConfig.credentials.issuerIdentifier;
// you MUST change the host route to match your application name
var callback_url = 'https://scaleSSO-TOR0117.mybluemix.net/auth/sso/callback';

var Strategy = new OpenIDConnectStrategy({
                 authorizationURL : authorization_url,
                 tokenURL : token_url,
                 clientID : client_id,
                 scope: 'openid',
                 response_type: 'code',
                 clientSecret : client_secret,
                 callbackURL : callback_url,
                 skipUserProfile: true,
                 issuer: issuer_id},
	function(accessToken, refreshToken, profile, done) {
	         	process.nextTick(function() {
		profile.accessToken = accessToken;
		profile.refreshToken = refreshToken;
		done(null, profile);
         	})
});

passport.use(Strategy);
app.get('/login', passport.authenticate('openidconnect', {}));

function ensureAuthenticated(req, res, next) {
	if(!req.isAuthenticated()) {
	          	req.session.originalUrl = req.originalUrl;
		res.redirect('/login');
	} else {
		return next();
	}
}

app.get('/auth/sso/callback',function(req,res,next) {
	    var redirect_url = req.session.originalUrl;
            passport.authenticate('openidconnect',{
                 successRedirect: redirect_url,
                 failureRedirect: '/failure',
          })(req,res,next);
        });


app.get('/hello', ensureAuthenticated, function(req, res) {
             res.send('Hello, '+ req.user['id'] + '!'); });

app.get('/failure', function(req, res) {
             res.send('login failed'); });

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(appEnv.port, function() {

	// print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

// comment out line below to disable deployment tracker
require("cf-deployment-tracker-client").track();
