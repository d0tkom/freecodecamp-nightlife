'use strict';

const yelp = require('yelp-fusion');

global.token = yelp.accessToken(process.env.YELP_ID, process.env.YELP_KEY).then(response => {
 global.token = response.jsonBody.access_token;
 console.log("acquired token from yelp")
 
}).catch(e => {
 console.log(e);
});