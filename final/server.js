//Express
var express = require('express');
var app = express();

//ejs
var ejs = require('ejs');

//HTTP and creating our awasome server
var http = require('http').createServer(app);

var port = process.env.PORT || 3000;
var server = app.listen(port);

//Sockets
var socket = require('socket.io').listen(server);

console.log("Server running and listening at port " + port);

//Setup public lib
app.use(express.static(__dirname + '/public'));
//Setup the views folder
app.set("views", __dirname + '/views');

//Setup ejs, so I can write HTML (:
app.engine('.html', ejs.__express);
app.set('view-engine', 'html');


//Router
app.get("/projector", function(req, res){
    res.render("projector.html");
});

app.get("/phone", function(req, res){
    res.render("phone.html")
});
app.get("/360", function(req, res){
    res.render("360.html")
});

socket.on('connection', function(client){
    console.log("we have a new user");

    client.on('rotations', function(number){
        //console.log('Getting rotations ' + number);
        var num = number;
        socket.sockets.emit("serverData", num);
    });

    client.on('disconnect', function(){
        console.log("A user dissconected");
    });
});
