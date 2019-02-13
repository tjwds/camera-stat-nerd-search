var express = require('express');
var app = express();
var proxy = require('http-proxy-middleware')

var keys = require('./keys.js')

// proxy middleware options
var options = {
  target: 'https://api.unsplash.com/', // target host
  changeOrigin: true, // needed for virtual hosted sites
  // ws: true, // proxy websockets
  // pathRewrite: {
  //   // '^/': `/api/new-path`, // rewrite path
  // },
  headers: {
    'Authorization': `Client-ID ${keys.KEY}`
  },
  // router: {
  //   // when request.headers.host == 'dev.localhost:3000',
  //   // override target 'http://www.example.org' to 'http://localhost:8000'
  //   'localhost:8080': 'http://localhost:8000'
  // }
}

// create the proxy (without context)
var exampleProxy = proxy(options)

// mount `exampleProxy` in web server
app.use('/', exampleProxy)
// app.listen(3000)

// app.get('/:path', function(req, res){
//   //  res.send("Hello World!");
//   axios.get(`https://api.unsplash.com/${req.params.path}?client_id=${client_id}`)
//   // .then(response => res.send(response))
// });

app.listen(3023, 'localhost');