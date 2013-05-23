var express = require('express');
var request = require('request');
var app = express();

var LAST_FM_API_KEY = "853293f7ee9c53639dd414a77d67c684";

app.get('/', function(req, res) {
    var body = 'Hello World';
    // res.setHeader('Content-Type', 'text/plain');
    // res.setHeader('Content-Length', body.length);
    res.send(body);
});

app.get('/api/recently_played/:user', function(req, res){
    var user = req.params.user;
    request({
	uri: "http://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&api_key=853293f7ee9c53639dd414a77d67c684&user=theefer&format=json&limit=1",
	qs: {
	    method: "user.getRecentTracks",
	    api_key: LAST_FM_API_KEY,
	    user: user,
	    format: "json",
	    limit: 1
	}
    }, function(error, response, body) {
	res.type('json');
	res.json(JSON.parse(body));
    });
});


app.listen(3000);
console.log('Listening on port 3000');
