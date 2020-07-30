/*jslint node: true, indent: 2*/

/*
server.js 
  Simplest node http file server allowing serving custom mime types

1. Determine the directory to be served via http (publicDir)
2. Determine where you will host this project locally (parentServerDir)
3. Install:
  # cd into your parentServerDir
  git clone https://github.com/nestoru/simple-http-file-server.git
  cd simple-http-file-server 
  npm install
4. Usage:
  node server.js --publicDir <your publicDir | defaults to currentDir> \
                 --port <your http port selection | defaults to 3000> \
                 --ipWhitelistFilePath <your ip authorized list>

5. Default usage:
  node server.js    
  
6. Custom usage:
  node server.js --publicDir ~/Documents/ --port 4000 --ipWhitelistFilePath ~/ipwhitelist.txt

7. To make sure the server persists after reboot:
nom install -g pm2
pm2 start process.yaml
pm2 save

TODO: Allow storing files via https using authentication.
*/

// definitions
const rateLimit = require("express-rate-limit");

const express = require('express'),
  serveStatic = require('serve-static'),
  serveIndex = require('serve-index'),
  path = require('path'),
  minimist = require('minimist'),
  ipWhitelist = require('ip-whitelist'),
  morgan = require('morgan'),
  mime = serveStatic.mime;

const args = minimist(process.argv.slice(2), {
  string: ['port', 'publicDir', 'ipWhitelistFilePath', 'user', 'password', 'maxConnections', 'connectionsInterval'],
  default: {
    port: 3000,
    publicDir: '.',
    ipWhitelistFilePath: null,
    user: null,
    password: null,
    maxConnections: null,
    connectionsInterval: null
  }
});

const absolutePublicDir = path.resolve(args.publicDir);

mime.define({
  'text/patch': ['patch'],
  'text/xml': ['wsdl']
});

// functions
function sendBasicAuthenticationChallenge(res) {
  res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Basic Authentication"' })
  res.end("Authentication required");
}

function authenticate(req, res) {
  if(args.user && args.password) {
    let authentication = req.headers.authorization;
    if(!authentication) {
      sendBasicAuthenticationChallenge(res);
      return false;
    } else {
      authentication = authentication.replace(/^Basic/, '');
      authentication = (new Buffer(authentication, 'base64')).toString('utf8');
      const credentials = authentication.split(':');
      if(credentials[0] != args.user || credentials[1] != args.password) {
        sendBasicAuthenticationChallenge(res);
        return false;
      } else {
        return true;
      }
    }
  } else {
    return true;
  }
}

// main
const app = express();

if(args.maxConnections && args.connectionsInterval) {
  console.log('Limiting connections to a max of ' + args.maxConnections + ' within ' + args.connectionsInterval + ' milliseconds');
  const limiter = rateLimit({
    windowMs: args.connectionsInterval,
    max: args.maxConnections
  });
  app.use(limiter);
}

app.use(function(req, res, next){
  if(authenticate(req, res)) {
    next()
  }
});

app.use(morgan(':method :url :status :remote-addr :res[content-length] - :response-time ms'));

if(args.ipWhitelistFilePath != null) {
  console.log(`Using ipWhitelistFilePath ${args.ipWhitelistFilePath}`);
  app.use(ipWhitelist(ipWhitelist.file(args.ipWhitelistFilePath)));
}

app.use(serveStatic(absolutePublicDir, {
  setHeaders: function(req, res) {
  }
}));

app.use(serveIndex(absolutePublicDir, {'icons': true, 'view': 'details'}), function(req, res){
});

app.listen(args.port, function(){
  console.log('Serving files from ' + absolutePublicDir + ' via http on port ' + args.port);
});
