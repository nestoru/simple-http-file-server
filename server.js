/*jslint node: true, indent: 2*/

/*
server.js 
- Simplest node http file server allowing serving custom mime types
- Drop this file in a directory to be served via http
- TODO: Allow storing files via http
*/

var connect = require('connect'),
  serveStatic = require('serve-static'),
  serveIndex = require('serve-index'),
  path = require('path'),
  mime = serveStatic.mime,
  port = 3000,
  publicDir = path.resolve('.');

mime.define({
  'text/patch': ['patch']
});

var app = connect()
  .use(serveStatic(publicDir))
  .use(serveIndex(publicDir, {'icons': true, 'view': 'details'}))
  .listen(port);

console.log('Serving files from ' + publicDir + ' via http on port ' + port);