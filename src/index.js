var express = require("express");
var sha256 = require('js-sha256');
var cors = require('cors');
var app = express();

module.exports = app;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '_xBcdFh1t4jROOT',
  database: 'simpleshopdb'
});

connection.connect(function(err){
    if (err) throw err;
    console.log("Connected to DB");
    var sql = [];
    sql.push( "CREATE TABLE IF NOT EXISTS users (username varchar(255) NOT NULL PRIMARY KEY, password varchar(255) NOT NULL, token varchar(255));");
    sql.push( "CREATE TABLE IF NOT EXISTS inventory (productId int NOT NULL AUTO_INCREMENT PRIMARY KEY, productName varchar(255) NOT NULL, price decimal(10,2), quantity int NOT NULL);");
    sql.push( "CREATE TABLE IF NOT EXISTS orders (orderId int NOT NULL AUTO_INCREMENT PRIMARY KEY, productId int NOT NULL, quantity int NOT NULL, price decimal(10,2), username varchar(255) NOT NULL, FOREIGN KEY (username) REFERENCES users(username), FOREIGN KEY (productId) REFERENCES inventory(productId));");
    for(var i = 0; i < sql.length; i++){
      connection.query(sql[i], function (err, result) {
        if (err){
          res.status(500);
          res.json({message: err.code});
        }
          //console.log(result);
      });
    }
});

app.listen(3000, () => {
 console.log("Server running on port 3000");
});

//Sanitize inputs for SQL Queries Function
var sanitizeInput = function(input){
  var sanitizedInput = input;
  if(typeof input !== 'string'){
    sanitizedInput = sanitizeInput.toString();
  }
  sanitizedInput = sanitizedInput.split("'").join('');
  sanitizedInput = sanitizedInput.split(";").join('');
  sanitizedInput = sanitizedInput.split("--").join('');
  return sanitizedInput;
}
//Get Requests
app.get("/login/:username/:password", function(req, res){
  console.log(req.params);
  //sanitize the username to prevent SQL injections
  var sanitizedUsername = sanitizeInput(req.params.username);

  //hash the password and then salt and hash again
  var salt = "ABCDEFGHIJK";
  var hash = sha256(req.params.password);
  hash = hash + salt;
  hash = sha256(hash);

  var sql = "SELECT token FROM users WHERE username='" + sanitizedUsername + "' AND password='" + hash + "';";
  connection.query(sql, function (err, result) {
    if (err){
      res.status(500);
      res.json({message: err.code});
    }
    if(result.length > 0){
      console.log(result);
      res.status(200);
      res.json({
        token: result[0].token,
        message: "Login Successful"});
    } else{
      res.status(404);
      res.json({message: "Incorrect Username or Password"});
    }
  });
});


app.get("/inventory", function(req, res){
  
  var sql = "SELECT * FROM inventory;";
  connection.query(sql, function(err, result){
    if (err){
      res.status(500);
      res.json({message: err.code});
    }
    else {
      res.status(200);
      res.json({data: result});
    }
  });
  
});

//Post Requests
app.post("/create_account", function(req, res){
  if(!req.body){
    res.status(400);
    res.json({message: "Bad Request"});
    return;
  }
  if(!req.body.username || !req.body.password){
    res.status(400);
    res.json({message: "Bad Request"});
    return;
  }
  //hash the password and then salt and hash again
  var salt = "ABCDEFGHIJK";
  var hash = sha256(req.body.password);
  hash = hash + salt;
  hash = sha256(hash);

  //create unique token
  var currentTimestampUnix = new Date().getTime() / 1000;
  var token = sha256(currentTimestampUnix + salt);

  //sanitize the username to prevent SQL injections
  var sanitizedUsername = sanitizeInput(req.body.username);

  var sql = "INSERT INTO users VALUES ('" + sanitizedUsername + "','" + hash + "','" + token +"');";
  connection.query(sql, function (err, result) {
    if (err){
      res.status(500);
      res.json({message: err.code});
    }
    else{
      res.status(200);
      res.json({ 
        token: token,
        message: "Account Created Successfully"});
      }
  });
});