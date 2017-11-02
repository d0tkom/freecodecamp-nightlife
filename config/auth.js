'use strict';

module.exports = {
	'twitterAuth': {
		'clientID': process.env.TWITTER_ID,
		'clientSecret': process.env.TWITTER_SECRET,
		'callbackURL': 'https://d0tkom-nightlife.herokuapp.com/auth/twitter/callback'
	}
};
