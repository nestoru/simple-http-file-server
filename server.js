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
5. Default usage:
  node server.js    
  
6. Custom usage:
  node server.js --publicDir ~/Documents/ --port 4000

7. To make sure the server persists after reboot:
nom install -g pm2
pm2 start process.yaml
pm2 save

TODO: Allow storing files via https using authentication.
*/

var connect = require('connect'),
  serveStatic = require('serve-static'),
  serveIndex = require('serve-index'),
  path = require('path'),
  minimist = require('minimist'),
  mime = serveStatic.mime;

var args = minimist(process.argv.slice(2), {
  string: ['port', 'publicDir'],
  default: {
    port: 3000,
    publicDir: '.'
  }
});

var absolutePublicDir = path.resolve(args.publicDir);

mime.define({
  'text/patch': ['patch'],
  'text/xml': ['wsdl']
});

var app = connect()
  .use(serveStatic(absolutePublicDir))
  .use(serveIndex(absolutePublicDir, {'icons': true, 'view': 'details'}))
  .listen(args.port);

console.log('Serving files from ' + absolutePublicDir + ' via http on port ' + args.port);
