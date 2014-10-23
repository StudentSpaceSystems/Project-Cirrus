
/**
 * Module dependencies.
 */


var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/cirrus');
var db = mongoose.connection;
console.log("attempting to connect to MongoDB");


var fieldDataSchema = mongoose.Schema({
	name: String,
	fields: [Number]
},{_id: false});


var numStreamSchema = mongoose.Schema({
	name: String,
	display: {
		type: String,
		enum: ['LINE','MAP']
		},
	persistence: Boolean,
	fields: [String]
},{_id: false});
var videoStreamSchema = mongoose.Schema({
	name: String,
	url: {
		type: String,
		validate: /https?:\/\/(www\.)?youtube.com\/.*/
		}
},{_id: false});
var launchSchema = mongoose.Schema({
	key: String, 
	name: String,
	date: Date,
	location: String,
	state: {
		type: String,
		enum: ['LIVE','POSTLIVE','RECORDED']
		},
	num_streams: [numStreamSchema],
	vid_streams: [videoStreamSchema]
});

var streamPacketSchema = mongoose.Schema({
	time: Date,
	streams: [fieldDataSchema],
});
var Launch;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log("connected to MongoDB");
	Launch = mongoose.model('launch',launchSchema,'launch');
	//var fir = new Launch();
	//fir.save(function (e,f){
	//	if (e) return console.error(e);
	//	console.log(fir);
	//});
	socketInit();
});
var app = express();

// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//app.use(express.favicon());
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

app.get('/', routes.index);


app.all('/register_launch',function (req,res){
	var data = req.body || req.query;
	console.log(data);
	console.log(data.num_streams[0].fields)
	var success = true;
	var done = false;
	Launch.find({ key: data.key}, function (err, docs) {
		if (err || docs.length)
		{
			success = false;
			if (err)
				console.log(err);
			
		}
		else
		{
			var stream = new Launch(data);
			stream.save(saveErrorLog);
		}
		done = true;
		res.send({'success': success});
	});

});


app.all('/get_stream_info',function(req,res){
	var data = req.body || req.query;
	Launch.find({ key: data.key}, function (err, docs) {
		if (err || !docs.length)
		{
			res.send({'success': false});
		}
		else
		{
			console.log(docs[0].num_streams[0].fields)
			
			
			res.send({
						'success': true,
						'info': {
									'date': docs[0].date,
									'location': docs[0].location,
									'name': docs[0].name,
									'num_streams': docs[0].num_streams,
									'vid_streams': docs[0].vid_streams
						}
					});
		}
	});

});

server = http.createServer(app);

var io = require('socket.io').listen(server);

server.listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});
function socketInit()
{
	io.sockets.on('connection', function (socket) {
		socket.on('register', function (data) {
			streamInit(socket,data);
		});
	});
}

function streamInit(socket,data)
{
	var Packet = mongoose.model(data.key,streamPacketSchema,data.key);
	socket.on(data.key,function (packet){
		console.log('new key!')
		var dataPoint = new Packet(packet);
		io.sockets.emit(data.key,packet);
		dataPoint.save(saveErrorLog);
	});
}

function saveErrorLog (e,f)
{
	if (e) return console.error(e);
}