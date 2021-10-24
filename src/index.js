var express = require("express");
var app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}))

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
    var sql = "CREATE TABLE IF NOT EXISTS users (username varchar(255) NOT NULL PRIMARY KEY, password varchar(255));"
    connection.query(sql, function (err, result) {
        if (err) throw err;
        //console.log(result);
      });
});

app.listen(3000, () => {
 console.log("Server running on port 3000");
});

app.get("/login", (req, res) => {
  console.log(req.body);
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
  else{
    var sql = "SELECT * FROM users WHERE username='" + req.body.username + "' AND password='" + req.body.password + "';";
    connection.query(sql, function (err, result) {
      if (err) throw err;
      if(result.length > 0){
        res.status(200);
        res.json({message: "Login Successful"});
      } else{
        res.status(404);
        res.json({message: "Incorrect Username or Password"});
      }
    });
  }
});