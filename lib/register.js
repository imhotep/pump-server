var geolib = require("geolib");

function Register() {
	this.messages = [];
}

Register.prototype = {
	postMessage: function (req, res) {
		var longitude = parseFloat(req.body.longitude),
			latitude = parseFloat(req.body.latitude),
			message = req.body.message;
		if (!latitude || !longitude || !message) {
			res.send(500, "Error.");
			return;
		}

		var location = {
				longitude: longitude,
				latitude: latitude
			};
		try {
			geolib.getDistance(location, location);
		} catch (e) {
			res.send(500, "Invalid format. " + location.longitude + " " + location.latitude);
			return;
		}
		this.messages.push({
			location: location,
			message: message,
			timestamp: Date.now()
		});

		res.send(200, "Ok");
	},

	getMessages: function (req, res) {
		var longitude = parseFloat(req.query.longitude),
			latitude = parseFloat(req.query.latitude),
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
