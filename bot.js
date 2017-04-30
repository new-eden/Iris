// Require Simple-XMPP and Slack-Node libraries
var xmpp = require("simple-xmpp");
var Slack = require("slack-node");

// Get the config
var config = require("./config.json");

// Function that returns the current time
var currentTime = function() {
	return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

// Output text to the terminal
var log = function(message) {
	console.log("%s - %s", currentTime(), message);
};

// PHP Style inArray
var inArray = function(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

xmpp.on("online", function(data) {
	log("Connected with JID: " + data.jid.user);
	log("Settings presence to available");
	xmpp.setPresence("online", "I'm right here - maybe..");
});

xmpp.on("error", function(err) {
	log(err);
});

xmpp.on("close", function() {
	log("Connection closed...");
});

// Handle Ping Broadcasts and messages (Issue is the "chat" function only handles messages where type is "chat", and pings have no type)
xmpp.on("stanza", function(stanza) {
	// If it's a message, we handle it just like the library does.
	if(stanza.is("message")) {
		var body = stanza.getChild("body");
		if(body) {
			var message = body.getText();
			var userString = stanza.attrs.from;
			var from = userString.split("/")[0];

			log("Received message/ping from ("+ from +"): " + message);

	        	// Pass message on to Discord
	        	slack = new Slack();
	        	slack.setWebhook(config.webhookurl);

				if(message.indexOf("to titan ==") > -1) {
					slack.webhook({
						channel: config.specialWebhooks.titan.webhookChannel,
						username: config.specialWebhooks.titan.webhookUsername,
						text: "@everyone **" + message + "**"
					}, function(err, response) {
						log(response);
					});
				} else {
					slack.webhook({
						channel: config.webhookChannel,
						username: config.webhookUsername,
						text: "@everyone **" + message + "**"
					}, function(err, response) {
						log(response);
					});
				}
		}
	}
});

xmpp.connect({
	jid: 		config.jid,
	password:	config.password,
	host:		config.host,
	port:		config.port
});

xmpp.getRoster();
