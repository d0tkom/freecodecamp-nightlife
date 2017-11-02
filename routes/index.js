var User = require('../models/user');
var Bar = require('../models/bar');
const yelp = require('yelp-fusion');

module.exports = function(app, passport) {
     /* GET home page. */
    app.get('/', function(req, res, next) {
      res.render('index', { title: 'Express' });
    });   
    
    app.get('/user', isLoggedIn, function(req, res) {
        console.log("get user");
        res.json(req.user);
    });
    
    app.get('/logout', isLoggedIn, function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/api/search/:term', function(req, res) {
        var term = req.params.term;
        //do search and return
        const client = yelp.client(global.token);
        client.search({
            location: term
        }).then(response => {
            let finished = 0;
            //TODO merge businesses with votes from db
            let arr = response.jsonBody.businesses;
            let len = arr.length;
            for (let i = 0; i < len; i++) {
                Bar.findOne({yelpId: arr[i].id}).exec((err, bar) => {
                    if (err) {
                        throw err;
                    }
                    if (!bar) {
                        arr[i].going = [];
                    }
                    else {
                        arr[i].going = bar.going;
                    }

                    finished++;
                    if (finished == len) {
                        res.json({businesses: arr});
                    }
                })
            }
        }).catch(e => {
            res.send(e);
        });
    });

    app.put('/api/bars/:id', isLoggedIn, function(req, res) {
        var id = req.params.id;
        var userId = req.user.id;
        console.log(userId);
        // if bar doesn't exist in db, create it
        Bar.findOne({ yelpId: id }).exec((err, bar) => {
            if (err) {
                console.log(err);
              res.status(500).send(err);
            }

            if(!bar) {
                //we didn't find bar in db, so we will create it
                var newBar = new Bar({yelpId: id, going: userId});
                newBar.save((err, saved) => {
                  if (err) {
                    console.log(err);
                    res.status(500).send(err);
                  }
                  console.log('saved');
                  res.status(200).send("we've recorded that you're going to " + id);
                });
            }
            else {
                //found bar. check if user has already voted
                var going = bar.going.filter((item) => {
                    return item[0] == userId;
                });
                if (going.length > 0) {
                    console.log(bar);
                    res.status(208).send("you're going already");
                }
                else {
                    bar.going.addToSet(userId);
                    console.log(bar);
                    
                    bar.save((err, updatedBar) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send(err);
                        }
                        res.status(200).send("we've recorded that you're going to " + id);
                    });
                }
            }
        })
    });

    //delete user from a bar's going array
    app.delete('/api/bars/:id', isLoggedIn, function(req, res) {
        var id = req.params.id;
        var userId = req.user.id;
        // if bar doesn't exist in db, create it
        Bar.findOne({ yelpId: id }).exec((err, bar) => {
            if (err) {
              res.status(500).send(err);
            }

            if(!bar) {
                //we didn't find bar in db, so we can't ungo
                res.status(208).send("you weren't going anyways");
            }
            else {
                //found bar. check if user has already going
                var going = bar.going.filter((item) => {
                    console.log(item[0]);
                    return item[0] == userId;
                });
                if (going.length == 0) {
                    res.status(208).send("you weren't going anyways");
                }
                else {
                    //user is filter array to not include user
                    var newArr = bar.going.filter((item) => {
                        return item[0] != userId;
                    });
                    bar.going = newArr;
                    bar.save(function (err) {
                        if (err) {
                            res.status(500).send(err);
                        }
                        res.status(200).send("we've recorded that you're NOT going to " + id + " after all");
                    });
                }
            }
        })
    });
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()) {
      console.log("authenticated");
      return next(); 
    }

    // if they aren't redirect them to the home page
    res.redirect('/');
}

