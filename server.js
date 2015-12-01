//---------------------------------------------------------------
// The purpose is to serve a file!
// First, run node server.js on one terminal
// Next, type localhost:4000/index.html on some browser
//---------------------------------------------------------------

var util = require('util');
var path = require('path');
var http = require('http');
var fs   = require('fs');
var server = http.createServer();
var usersConnected = Array();
var packet = {
  type:"",
  data:""
};

// attach handler
server.on('request', function (req,res) {
  var file = path.normalize('.' + req.url);

  fs.exists(file, function(exists) {
    if (exists) {
      var rs = fs.createReadStream(file);

      rs.on('error', function() {
        res.writeHead(500); // error status
        res.end('Internal Server Error');
      });


      res.writeHead(200); // ok status

      // PIPE the read stream with the RESPONSE stream
      rs.pipe(res);
    } 
    else {
      res.writeHead(404); // error status
      res.end('NOT FOUND');
    }
  });

}); // end server on handler

server.listen(4000);


/*websocket stuff*/
var io = require('socket.io').listen(5000);

io.sockets.on('connection', function(socket) {

  socket.on('myEvent', function(content) {
    console.log(content); 
    socket.emit('server', "This is the server: got your message");
    var num = 3;

    var interval = setInterval( function() {
        socket.emit('server', num + ": message from server");
        if (num-- == 0) { 
          clearInterval(interval); // stops timer
        }
    }, 1000); // fire every 1 second
    
  });

  socket.on('getUsers', function(content) {
    console.log(content);

    //parse JSON
    var pkt = JSON.parse(content);

    //loop through array of users and emit them each back

    //emit all the users in the array
    socket.emit('server', "This is the server: got your message");
    
  });

  //login
  socket.on('login', function(content) {

    //display in console
    console.log("Server " +content); 

    //parse the json so we can work with it
    var pkt = JSON.parse(content);

    //authenticate the login (content)

    //if good, add user to the list
    usersConnected.push(pkt.data);


    //show who is logged in
    socket.emit('server', content);
    
  });

  //logout
  socket.on('logout', function(content) {

    //logout the person and redirect
    console.log(content); 

    socket.emit('server', "Logged in: USERNAME HERE");
    
  });

});
