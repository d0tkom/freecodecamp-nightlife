var User = require('../models/user');
var Bar = require('../models/bar');
const yelp = require('yelp-fusion');

module.exports = function(app, passport) {
     /* GET home page. */
    app.get('/', function(req, res, next) {
        console.log(token);
        
      res.render('index', { title: 'Express' });
    });   
    
    app.get('/user', isLoggedIn, function(req, res) {
        res.json(req.user);
    });
    
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/api/search/:term', function(req, res) {
        console.log(global.token);
        var term = req.params.term;
        if (req.isAuthenticated()) {
            // save last search
            User.findOne({id: req.user.id}).exec((err, user) => {
                if (err) {
                  res.status(500).send(err);
                }
                user.lastSearch = term;
                user.save(function (err, updatedUser) {
                    if (err) {
                      throw err;
                    }
                    console.log("updated user last search: " + updatedUser);
                });
            });
        }
        //do search and return
        const client = yelp.client(global.token);
        client.search({
            location: term
        }).then(response => {
            //TODO merge businesses with votes from db
            var arr = response.jsonBody.businesses;
            var len = arr.length;
            for (var i = 0; i < len; i++) {
                let ind = i;
                Bar.findOne({yelpId: arr[ind].id}).exec((err, bar) => {
                    if (err) {
                        throw err;
                        //res.status(500).send(err);
                    }
                    if (!bar) {
                        arr[ind].going = new Array();
                    }
                    else {
                        console.log('found bar');
                        arr[ind].going = bar.going;
                    }

                    if (ind == len-1) {
                        res.json({businesses: arr});
                    }
                })
            }
        }).catch(e => {
            console.log(e);
            res.send(e);
        });
    });

    app.put('/api/bars/:id', function(req, res) {
        var id = req.params.id;
        //var userId = req.user.id;
        var userId = "hehe";
        // if bar doesn't exist in db, create it
        Bar.findOne({ yelpId: id }).exec((err, bar) => {
            if (err) {
              res.status(500).send(err);
            }

            if(!bar) {
                //we didn't find bar in db, so we will create it
                var newBar = new Bar({yelpId: id, going: userId});
                newBar.save((err, saved) => {
                  if (err) {
                    res.status(500).send(err);
                  }
                  console.log('saved');
                  res.send("we've recorded that you're going to " + id);
                });
            }
            else {
                //found bar. check if user has already voted
                var going = bar.going.filter((item) => {
                    return item[0] == userId;
                });
                if (going.length > 0) {
                    console.log(bar);
                    res.send("you're going already");
                }
                else {
                    bar.going.addToSet(userId);
                    console.log(bar);
                    
                    bar.save((err, updatedBar) => {
                        if (err) {
                            res.status(500).send(err);
                        }
                        res.send("we've recorded that you're going to " + id);
                    });
                }
            }
        })
    });

    //delete user from a bar's going array
    app.delete('/api/bars/:id', function(req, res) {
        var id = req.params.id;
        //var userId = req.user.id;
        var userId = "hehe";
        // if bar doesn't exist in db, create it
        Bar.findOne({ yelpId: id }).exec((err, bar) => {
            if (err) {
              res.status(500).send(err);
            }

            if(!bar) {
                //we didn't find bar in db, so we can't ungo
                res.send("you weren't going anyways");
            }
            else {
                //found bar. check if user has already going
                var going = bar.going.filter((item) => {
                    console.log(item[0]);
                    return item[0] == userId;
                });
                if (going.length == 0) {
                    res.send("you weren't going anyways");
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
                        res.send("we've recorded that you're NOT going to " + id + " after all");
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

