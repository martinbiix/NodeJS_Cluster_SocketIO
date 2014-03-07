var cluster = require('cluster');
var os = require('os');


if (cluster.isMaster) {
  // we create a HTTP server, but we do not use listen
  // that way, we have a socket.io server that doesn't accept connections
  var server = require('http').createServer();
  var io = require('socket.io').listen(server);
  var fs = require('fs');

  var RedisStore = require('socket.io/lib/stores/redis');
  var redis = require('socket.io/node_modules/redis');

  io.set('store', new RedisStore({
    redisPub: redis.createClient(),
    redisSub: redis.createClient(),
    redisClient: redis.createClient()
  }));

  setInterval(function() {
    // all workers will receive this in Redis, and emit
    io.sockets.emit('data', 'payload');
  }, 1000);

  for (var i = 0; i < os.cpus().length; i++) {
    console.log("CPU: "+i);
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  }); 
}

if (cluster.isWorker) {
  var express = require('express');
  var app = express();

  var http = require('http');
  var server = http.createServer(app);
  var io = require('socket.io').listen(server);

  var RedisStore = require('socket.io/lib/stores/redis');
  var redis = require('socket.io/node_modules/redis');


  server.listen(3010);

    io.set('transport'[
      'websocket',
      'flashsocket',
      'htmlfile',
      'xhr-polling',
      'jsonp-poling'
    ]);

    io.set('store', new RedisStore({
      redisPub: redis.createClient(),
      redisSub: redis.createClient(),
      redisClient: redis.createClient()
    }));



  io.sockets.on('connection', function(socket) {
    socket.emit('data', 'connected to worker: ' + cluster.worker.id);
    socket.on("error", function(err){
      console.log("ERROR: ");
      console.log(err);
    });
  });
  //app.listen(3010);
}