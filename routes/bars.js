var Bar = require('../models/bar');
var cuid = require('cuid');

module.exports = function(app, passport) {
 app.get('/api/bars', function(req, res) {
  Bar.find().sort('-dateAdded').exec((err, bars) => {
    if (err) {
      res.status(500).send(err);
    }
    res.json({ bars });
  });
});

 app.get('/api/mybars', isLoggedIn, function (req, res) {
  Bar.find({userId: req.user.id}).sort('-dateAdded').exec((err, bars) => {
    if (err) {
      res.status(500).send(err);
    }
    res.json({ bars });
  });
});

app.post('/api/bars', isLoggedIn, (req, res) => {
  if (!req.body.bar.title || !req.body.bar.options) {
    res.status(403).end();
  }
  // Let's sanitize inputs
  //newBar.title = sanitizeHtml(newBar.title);
  //newBar.options = sanitizeHtml(newBar.options);
  var newBar = new Bar(req.body.bar);
  newBar.cuid = cuid();
  newBar.userId = req.user.id;
  newBar.save((err, saved) => {
    if (err) {
      res.status(500).send(err);
    }
    console.log('saved');
    res.json({ bar: saved });
  });
});

app.get('/api/bars/:cuid', (req, res) => {
  Bar.findOne({ cuid: req.params.cuid }).exec((err, bar) => {
    if (err) {
      res.status(500).send(err);
    }
    res.json({ bar });
  });
});

app.delete('/api/bars/:cuid', isLoggedIn, (req, res) => {
  // The "todo" in this callback function represents the document that was found.
  // It allows you to pass a reference back to the client in case they need a reference for some reason.
  console.log(req.params.cuid);
  
  
  Bar.findOneAndRemove({ cuid: req.params.cuid }, (err, bar) => {  
    if (err) {
      console.log("error 500");
      res.status(500).send(err);
      return;
    }
    if (bar === null) {
      res.status(500).send("not found :(");
      return;
    }
      // We'll create a simple object to send back with a message and the id of the document that was removed
      // You can really do this however you want, though.
      let response = {
          message: "Bar successfully deleted",
          id: bar._id
      };
      res.status(200).send(response);
  });
});



app.post('/api/bars/:cuid/:id', (req, res) => {
  var id = req.params.id;
  Bar.findOne({ cuid: req.params.cuid }).exec((err, bar) => {
    console.log(bar);
    if (err) {
      console.log("error 500");
      res.status(500).send(err);
    }
    
    var currObj = bar.options[id][0];
    currObj.votes++;
    bar.options.set(id, [currObj]);
    

    bar.save(function (err, updatedBar) {
      if (err) {
        throw err;
      }
      res.json({updatedBar});
    });
  });
}); 


app.post('/api/bars/:cuid/new/:newVote', isLoggedIn, (req, res) => {
  Bar.findOne({ cuid: req.params.cuid }).exec((err, bar) => {
    console.log(bar);
    if (err) {
      console.log("error 500");
      res.status(500).send(err);
    }
    console.log(bar);
    var title = req.params.newVote;
    console.log(title);
    bar.options.addToSet([[{title: title, votes: 1}]]);
    
  
    bar.save(function (err, updatedBar) {
      if (err) {
        throw err;
      }
      res.json({updatedBar});
    });
  });
}); 


};

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
