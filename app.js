var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    async = require('async'),
    dust = require('dustjs-helpers'),
    app = express();

var mongo = require('mongodb');
var mongoose = require('mongoose');

var flash = require('connect-flash');

app.use(flash());

var session = require('express-session');


app.use(session({ cookie: { maxAge: 60000 },
    secret: 'woot',
    resave: false,
    saveUninitialized: false}));


const options = {
    reconnectTries: 10,
    poolSize: 10
};
mongoose.connect('mongodb://localhost/recipebookdb', options).then(() => {
    console.log("Database Connection")
});
var db = mongoose.connection;
var recipies = require('./model/Recipies')

// DB Connect String


// Assign Dust Engine To .dust Files
app.engine('dust', cons.dust);

// Set Default Ext .dust
app.set('view engine', 'dust');
app.set('views', __dirname + '/views');

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function (req, res) {
    var data = recipies.find()
    res.render('index', {recipes: data});
});


app.post('/add', function (req, res) {
    var recipie = new recipies();

    recipie.name = req.body.name;
    recipie.ingredients = req.body.ingredients;
    recipie.directions = req.body.directions;

    recipies.findOne({"name": req.body.name}, function (err, existingUser) {

        if (existingUser) {
            req.flash('errors', 'Recipe with that name already exists');
            return res.redirect('/add');
        } else {
            recipie.save(function (err) {
                if (err) {
                    console.log('ERROR')
                }
            });
        }
    });
    res.redirect('/');
});


app.delete('/delete/:id', function (req, res) {
    recipies.findByIdAndRemove(req.params.id,function(err,recipe){
        var response={
            message: "successfully deleted",
            id: req.params.id
        };
        res.send(response);
    });

});




app.post('/edit', function (req, res) {
    // client.query("UPDATE recipes SET name=$1, ingredients=$2, directions=$3 WHERE id = $4",
    //	[req.body.name, req.body.ingredients, req.body.directions,req.body.id]);

    recipies.find({_id: req.body.id}, function (err, recipie) {

        if (err) return next(err);

        if (req.body.name){
            recipie[0].name = req.body.name;
        }
        if (req.body.ingredients){
            recipie[0].ingredients = req.body.ingredients;
        }
        if (req.body.directions){
            recipie[0].directions = req.body.directions;
        }


        recipie[0].save(function(err) {
            if (err) return err;
            req.flash('success', 'Successfully Edited your profile');
            res.send();
            return res.redirect('/');
        });
    });


});


// Server
app.listen(3000, function () {
    console.log('Server Started On Port 3000');
});
