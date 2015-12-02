//---------------------------------------------------------------
// SE319 Lab 11
// First, run node server.js in a terminal
// Next, type localhost:4000/index.html on some browser
//---------------------------------------------------------------

var util = require('util');
var path = require('path');
var http = require('http');
var fs   = require('fs');
var server = http.createServer();
var usersConnected = Array();
var posts = Array();
var packet = {
  type:"",
  data:""
};
var post = {
  title:"",
  data:"",
  user:""
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
var CLIENTS=[];

io.sockets.on('connection', function(socket) {
  //add new client to list of clients connected
  CLIENTS.push(socket);

  //say that a client connected
  console.log("Client Connected!");

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

  //event to get everyone who is connected
  socket.on('getUsers', function(content) {
    console.log("Get Users: " + content);

    //parse JSON
    var pkt = JSON.parse(content);

    //loop through array of users and emit them each back
    for (var i=0; i<usersConnected.length; i++) {
      pkt.data = usersConnected[i];
      socket.emit('server', JSON.stringify(pkt));
    }
    
  });

  //event to get the latest user
  socket.on('getNew', function(content) {
    console.log("Get New: " + content);

    //parse JSON
    var pkt = JSON.parse(content);

    //emit back to who called it
    pkt.data = usersConnected[usersConnected.length-1];
    socket.emit('server', JSON.stringify(pkt));
    
  });

  //login
  socket.on('login', function(content) {

    //display in console
    console.log("Login:" + content); 

    //parse the json so we can work with it
    var pkt = JSON.parse(content);

    //authenticate the login (content)

    //if good, add user to the list
    usersConnected.push(pkt.data);

    //tell everyone who logged in
    sendAll(content);

    /*pkt.type = "uname";

    //tell the client who it is
    socket.emit('server', JSON.stringify(pkt));*/
    
  });

  //logout
  socket.on('logout', function(content) {

    //display in console
    console.log("Logout:" + content);

    //parse the json so we can work with it
    var pkt = JSON.parse(content);

    //remove user from the usersConnected array
    for(var i=0; i<usersConnected.length; i++){
      if(pkt.data == usersConnected[i]){
        usersConnected.splice(i, 1);
        pkt.data = "success";
        break;
      }
      
    }

    //broadcast success message
    //socket.emit('server', JSON.stringify(pkt));
    sendAll(JSON.stringify(pkt));
    
  });

  //event for adding posts
  socket.on('add_post', function(content) {

    //display in console
    console.log("Add Post:" + content);

    //parse the json so we can work with it
    var pkt = JSON.parse(content);

    //add post to the posts array
    posts.push(pkt.data);

    //broadcast success message
    //socket.emit('server', JSON.stringify(pkt));
    sendAll(content);
    
  });

  //event to get everyone who is connected
  socket.on('getPosts', function(content) {
    console.log("Get Posts: " + content);

    //parse JSON
    var pkt = JSON.parse(content);

    //loop through array of users and emit them each back
    for (var i=0; i<posts.length; i++) {
      pkt.data = posts[i];
      socket.emit('server', JSON.stringify(pkt));
    }
    
  });

});

//broadcast the content to everyone connected
function sendAll(content){
  //show what is happening
  console.log("Send All!");

  //loop through every client in the array
  for(var i=0; i<CLIENTS.length; i++){
    CLIENTS[i].emit('server',content);
  }
}
