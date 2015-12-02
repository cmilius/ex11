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
  user:"",
  id:"",
};

//attach handler
server.on('request', function (req,res) {
  var file = path.normalize('.' + req.url);

  fs.exists(file, function(exists) {
    if (exists) {
      var rs = fs.createReadStream(file);

      rs.on('error', function() {
        //error status 500
        res.writeHead(500); 
        res.end('Internal Server Error');
      });

      //ok status code
      res.writeHead(200); 

      //PIPE the read stream with the RESPONSE stream
      rs.pipe(res);
    } 
    else {
      //error status code
      res.writeHead(404); 
      res.end('NOT FOUND');
    }
  });

}); // end server on handler

//listen on port 4000
server.listen(4000);

//websocket stuff
var io = require('socket.io').listen(5000);
var CLIENTS=[];

io.sockets.on('connection', function(socket) {
  //add new client to list of clients connected
  CLIENTS.push(socket);

  //say that a client connected
  console.log("Client Connected!");

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

    //broadcast success message to everyone
    sendAll(JSON.stringify(pkt));
    
  });

  //event for adding posts
  socket.on('add_post', function(content) {

    //variable
    var pst = {
      title:"",
      content:"",
      user:"",
      id:"",
    };

    //display in console
    console.log("Add Post:" + content);

    //parse the json so we can work with it
    var pkt = JSON.parse(content);

    //build post object
    pst.title = pkt.data.title;
    pst.content = pkt.data.content;
    pst.user = pkt.data.user;
    pst.id = posts.length;

    //add post to the posts array
    posts.push(pst);

    //broadcast success message to everyone
    sendAll(content);
    
  });

  //event to get everyone who is connected
  socket.on('getPosts', function(content) {
    //display in console
    console.log("Get Posts: " + content);

    //parse JSON
    var pkt = JSON.parse(content);

    //loop through array of users and emit them each back
    for (var i=posts.length-1; i>=0; i--) {
      pkt.data = posts[i];
      socket.emit('server', JSON.stringify(pkt));
    }
  });

  //remove_post
  socket.on('remove_post', function(content) {

    //display in console
    console.log("remove_post:" + content);

    //parse the json so we can work with it
    var pkt = JSON.parse(content);

    //remove post from the posts array
    posts.splice(pkt.data, 1);

    //update all post ids
    for(var i=0; i<posts.length; i++){
      posts[i].id = i;
    }

    //broadcast success message
    pkt.type = "add_post";
    sendAll(JSON.stringify(pkt));
    
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
