var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);
var path    = require("path");
var aWss = expressWs.getWss('/');

var new_topics = [];
var last_sent_timestamp = 1;

// Init redis client
var client = require('redis').createClient(process.env.REDIS_URL || "redis://localhost:6379");
var admin_token = process.env.ADMIN_TOKEN;
var bodyParser = require('body-parser')

client.on("error", function (err) {
    console.log("Error " + err);
});

function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function admin_auth(req, res, next){
  token = req.body.token;
  if ( token != admin_token ){
    res.status(401).send('You shall not pass.')
  }
  next();
}

function send_data(clients){
   var response = client.hgetall('topics', function(err, reply){
       var words = reply;
     var new_clients = client.lrange('new_topics',0,19, function(err,reply){
       var new_topics = reply;
       var updated = client.get('updated', function(err,reply){
         var updated = reply;
         var word_array = [];
         for (var key in words) {
           word_array.push({"text": key, "value": words[key], "size": 20*Math.sqrt(words[key]), rotation: ~~(Math.random() * -2) * 90});
         }
         word_array = word_array.sort(function(a,b) { return b.value - a.value; });
         new_topics = new_topics.slice(-20);
         var res = {topics: word_array, new_topics: new_topics, timestamp: updated }
         res = JSON.stringify(res);
         for(var i = 0; i < clients.length; i++){
           clients[i].send(res);
         }
      });
    });
  });
}

app.use( bodyParser.json() );

app.get('/', function(req, res, next){
  res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/clear', function(req, res, next){
  client.del('topics');
  client.del('new_topics');
  client.del('updated');
  return res.redirect('/'); 
});

app.post('/admin/merge', admin_auth, function(req, res, next){
  var date = new Date();
  from = toTitleCase(req.body.from);
  to = toTitleCase(req.body.to);
  client.hget('topics',from, function(err,from_votes){
    client.hget('topics', to, function(err,to_votes){
      client.hset('topics',to,(parseInt(from_votes) + parseInt(to_votes)), function(err,reply){
        console.log('deleting: '+from);
        client.hdel('topics',from);
        client.set("updated",date.getTime()+"");
        return res.redirect('/'); 
      });
    });
  });
});

app.post('/admin/delete', admin_auth,  function(req, res, next){
  var date = new Date();
  topic = toTitleCase(req.body.topic);
  client.hdel('topics',topic);
  client.set("updated",date.getTime()+"");
  return res.redirect('/'); 
});

function sendToAll(){
  send_data(Array.from(aWss.clients));
}
 
app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
    var topic = toTitleCase(msg);
    var date = new Date();
    client.hincrby("topics", topic,1, function(err,reply){
      if (reply == 1){
        client.lpush("new_topics",topic);
      }
      client.ltrim("new_topics",0,100);
    });
    client.set("updated",date.getTime()+"");
    send_data([ws]);
  });
  send_data([ws]);
});

setInterval( function(){
  client.get('updated',function(error,ts){
    if ( last_sent_timestamp != ts ){
      last_sent_timestamp = ts;
      sendToAll();
    }
  });
}, 5000);


app.use(express.static('public'))
var port = process.env.PORT || 8080;
app.listen(port);
