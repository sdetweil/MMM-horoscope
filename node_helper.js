/* MMM-horoscope
 * Node Helper
 *
 * By morozgrafix https://github.com/morozgrafix/MMM-horoscope
 *
 * License: MIT
 *
 * Based on https://github.com/fewieden/MMM-soccer/blob/master/node_helper.js
 *
 */
// watch out for node 18+ supplying fetch built in
// assume we have it
var fetchit=fetch
// if we DON'T have it
if(fetchit === undefined)
	// then load something that will work
  fetchit = require("node-fetch");

const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
	// subclass start method
	start: function(){
		this.getting_horoscope_data = false;
	},

	// subclass socketNotificationReceived method
	socketNotificationReceived: function(notification, payload) {

		if (notification === "GET_HOROSCOPE_DATA") {
			this.getHoroscope(payload);
		}
	},

	// get data from URL and broadcast it to MagicMirror module if everyting is OK
	getHoroscope: function(payload) {

		let url = 'https://www.astrology.com/horoscope/daily/' + payload.sign +'.html';
		console.log("requesting data for id="+payload.id)
		fetchit(url)
			.then((response) => response.text())
			.then((body) => {

				let startPattern = "<div id=\"content\">";
				let start = body.search(startPattern);
				let stop = (body.slice(start)).search("</div>");
				let horoscopeText = body.slice(start + startPattern.length, start + stop);

				startPattern = "<span style=\"font-weight: 400\">";
				start = horoscopeText.search(startPattern);
				stop = (horoscopeText.slice(start)).search("</span>");
				horoscopeText = horoscopeText.slice(start + startPattern.length, start + stop);

				startPattern = "<span id=\"content-date\">";
				start = body.search(startPattern);
				stop = (body.slice(start)).search("</span>");
				let horoscopeDate = body.slice(start + startPattern.length, start + stop);

				console.log("sending response for id="+payload.id)
				this.sendSocketNotification("HOROSCOPE_DATA", {id:payload.id,
						text: horoscopeText,
						date: horoscopeDate });
			})
			.catch((error) => {
				this.sendSocketNotification("HOROSCOPE_DATA", {id:payload.id});
				console.log("Error getting Horoscope data. Response:" + JSON.stringify(response));
			})
			.finally(() => {
				this.getting_horoscope_data = false;
			});
	}
});
