var geolib = require("geolib");

function Register() {
	this.messages = [];
}

Register.prototype = {
	postMessage: function (req, res) {
		var longitude = req.body.longitude,
			latitude = req.body.latitude,
			message = req.body.message;
		if (!latitude || !longitude || !message) {
			res.send(500, "Error.");
			return;
		}

		this.messages.push({
			location: {
				longitude: longitude,
				latitude: latitude
			},
			message: message,
			timestamp: Date.now()
		});

		res.send(200, "Ok");
	},

	getMessages: function (req, res) {
		var longitude = req.query.longitude,
			latitude = req.query.latitude,
			radius = parseFloat(req.query.radius);
		if (!latitude || !longitude || isNaN(radius)) {
			res.send(500, "Error.");
			return;
		}
		var result = {
				messages: []
			},
			currentLocation = {
				longitude: longitude,
				latitude: latitude
			};

		for (var i = 0; i < this.messages.length; ++i) {
			var message = this.messages[i],
				distance = geolib.getDistance(message.location, currentLocation);
			if (distance > radius)
				continue;
			result.messages.push({
				location: message.location,
				message: message.message,
				distance: distance,
				timestamp: message.timestamp
			});
		}

		res.send(200, JSON.stringify(result));
	},

	install: function(app) {
		app.post('/message', this.postMessage.bind(this));
		app.get('/messages', this.getMessages.bind(this));
	}
}

exports.create = function() {
	return new Register();
}
