var express= require("express");
var cros = require("cors");
var bodyParser = require("body-parser");
var app = express();

var routes = require('./routes.js');

app.use(cros());
app.use(bodyParser.json({limit: '50mb', type:'application/json'}));
app.use(bodyParser.urlencoded({ extended: true }));

// a middleware function with no mount path. This code is executed for every request to the router
app.use(function (req, res, next) {
    console.log('Time:', Date.now())
    next()
  })

app.use('/api',routes);

var server =app.listen(3001,function(){
    server.setTimeout(600000);
    console.log("server started at 3001");
})