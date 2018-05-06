var express = require('express')
var app = express();

// import entire SDK
var AWS = require('aws-sdk');
// import AWS object without services
var AWS = require('aws-sdk/global');


 multer = require('multer'),
	multerS3 = require('multer-s3');
	
var accessKeyId =  process.env.AWS_ACCESS_KEY || "AKIAI7YYZOPLAKZRS45A";
var secretAccessKey = process.env.AWS_SECRET_KEY || "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";

AWS.config.update({
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});
// import individual service
//var S3 = require('aws-sdk/clients/s3');
var mysql = require('mysql')
var fs = require('fs');

var bucketname='gc-4';


var bucketParams = {
   Bucket : bucketname
};   
//AWS.config.update({region: 'REGION'});

// Create S3 service object
//s3 = new AWS.S3({apiVersion: '2006-03-01'});
                    
var s3 = new AWS.S3({ /* ... */ })
// var params = {
//             Bucket: bucketname,
//             Key: 'myKey1234.jpg',
//             Body: "Hello"
//         };

        // s3.putObject(params, function (perr, pres) {
        //     if (perr) {
        //         console.log("Error uploading data: ", perr);
        //     } else {
        //         console.log("Successfully uploaded data to myBucket/myKey");
        //     }
		// });
		

// app.post('/upload', upload.array('upl',1), function (req, res, next) {

// 	console.log(req.files);
//     res.send("Uploaded!");
// });

// s3.createBucket({ Bucket : 'gc-2'}, function(err, data) {
//    if (err) {
//       console.log("Error", err);
//    } else {
//       console.log("Success", data.Location);
//    }
// });

// Call S3 to list current buckets


// s3.listBuckets(function(err, data) {
//    if (err) {
//       console.log("Error", err);
//    } else {
//       console.log("Bucket List", data.Buckets);
//    }
// });

// // Call S3 to create the bucket
// s3.listObjects(bucketParams, function(err, data) {
//    if (err) {
//       console.log("Error", err);
//    } else {
//       console.log("Success", data);
//    }
// });
/**
 * This middleware provides a consistent API 
 * for MySQL connections during request/response life cycle
 */ 
var myConnection  = require('express-myconnection')
/**
 * Store database credentials in a separate config.js file
 * Load the file/module and its values
 */ 
var config = require('./config')
var dbOptions = {
	host:	  config.database.host,
	user: 	  config.database.user,
	password: config.database.password,
	port: 	  config.database.port, 
	database: config.database.db
}
/**
 * 3 strategies can be used
 * single: Creates single database connection which is never closed.
 * pool: Creates pool of connections. Connection is auto release when response ends.
 * request: Creates new connection per new request. Connection is auto close when response ends.
 */ 
app.use(myConnection(mysql, dbOptions, 'pool'))

/**
 * setting up the templating view engine
 */ 
app.set('view engine', 'ejs')




// var upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: bucketname,
//     metadata: function (req, file, cb) {
		
//  
// 		console.log(file);
//       cb(null, {fieldName: file.fieldname});
//     },
//     key: function (req, file, cb) {
//       cb(null, Date.now().toString())
//     }
//   })
// })
  
// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: bucketname,
//   //  acl: 'public-read',
//     key: function (request, file, cb) {
//       console.log(file);
//       cb(null, file.originalname);
//     }
//   })
// }).array('image', 1);

// app.post('/upload', function (request, response, next) {
//   upload(request, response, function (error) {
//     if (error) {
//       console.log(error);
//       return response.redirect("/error");
//     }
//     console.log('File uploaded successfully.');
//     response.redirect("/success");
//   });
// });



var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: bucketname,
        key: function (req, file, cb) {
            console.log(file);
            cb(null,  Date.now()+'test_'+file.originalname); //use Date.now() for unique file keys
        }
    })
});

app.post('/upload', upload.array('image',5), function (req, res, next) {
	 
    res.send("Uploaded!");
});
/**
 * import routes/index.js
 * import routes/users.js
 */ 
var index = require('./routes/index')
var users = require('./routes/users')


/**
 * Express Validator Middleware for Form Validation
 */ 
var expressValidator = require('express-validator')
app.use(expressValidator())


/**
 * body-parser module is used to read HTTP POST data
 * it's an express middleware that reads form's input 
 * and store it as javascript object
 */ 
var bodyParser = require('body-parser')
/**
 * bodyParser.urlencoded() parses the text as URL encoded data 
 * (which is how browsers tend to send form data from regular forms set to POST) 
 * and exposes the resulting object (containing the keys and values) on req.body.
 */ 
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


/**
 * This module let us use HTTP verbs such as PUT or DELETE 
 * in places where they are not supported
 */ 
var methodOverride = require('method-override')

/**
 * using custom logic to override method
 * 
 * there are other ways of overriding as well
 * like using header & using query value
 */ 
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

/**
 * This module shows flash messages
 * generally used to show success or error messages
 * 
 * Flash messages are stored in session
 * So, we also have to install and use 
 * cookie-parser & session modules
 */ 
var flash = require('express-flash')
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser('keyboard cat'))
app.use(session({ 
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: 60000 }
}))
app.use(flash())


app.use('/', index)
app.use('/users', users)

app.listen(3000, function(){
	console.log('Server running at port 3000: http://127.0.0.1:3000')
})
