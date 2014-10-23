
/**
 * Module dependencies.
 */
if (!process.argv[2])
{
	console.log("usage: nodejs [SCRIPT] [PORT]");
	process.exit();
}
var CIRRUS_SERVER_URL = 'http://localhost:3001';
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var request = require('request');
var app = express();
var socket = require('socket.io-client').connect("http://localhost:3001");
// all environments
app.set('port', process.env.PORT || Number(process.argv[2]) || 1337);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/startstream', function(req,res) {
	socket.emit('register',req.query);
	
	res.send({success: true});
});
app.get('/sendpacket', function(req,res){
	
	
});
var key;
var example_reg = {
		key:"bluemoon2",
		name:"Bluemoon v. 1",
		date: (new Date),
		location:"IL",
		state:"LIVE",
		num_streams: [
		    {
		    	name: "test",
		    	display: "LINE",
		    	persistence: true,
		    	fields: ["top","bot"]
			}
		],
		vid_streams: [
		    {
		    	name: "videooo",
		    	url: "http://www.youtube.com/cats"
		    }
		]
	};
app.get('/testreg',function(req,res){
	console.log(CIRRUS_SERVER_URL+'/register_launch');
	request.post(CIRRUS_SERVER_URL+'/register_launch', {form: example_reg}, function(error,response,data){
		console.log('tst');
		if (error)
		{
			res.send({test:'fail'});
		}
		else
		{
			try{
				data = JSON.parse(data);
			}
			catch(E){
				res.send({test:'fail'});
			}
			if (!data.success)
			{
				res.send({test:'fail'});
			}
			else
			{
				key = example_reg['key'];
				socket.emit('register',{
					'key': key
				});
					res.send({test:'success'});
			}
		}
	});
});

app.get('/testpacket',function(req,res){
	socket.emit(key,{
		time: (new Date),
		streams: [
		    {
		    	name: 'test',
		    	fields: [5,7]
		    }
		    	  ]
	});
	res.send({test:'test'});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
