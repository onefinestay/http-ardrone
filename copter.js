// first detect the ip address to ensure we are on the copter's network
// set this to the IP that your drone assigns when you connect to its wifi network
var COPTER_NETWORK_IP = '192.168.1.2';

function checkConnection(){
  var os=require('os');
  var ifaces=os.networkInterfaces();
  var connected=false;

  for (var dev in ifaces) {
    var alias=0;
    ifaces[dev].forEach(function(details){
      if (details.family=='IPv4' && ( dev=='en0' || dev=='en1') ) {
        console.log('Found IP address: ' + details.address);
        if(details.address==COPTER_NETWORK_IP){
          connected=true;
          console.log('Copter network connected, using IP: ' + COPTER_NETWORK_IP);
        }
        ++alias;
      }
    });
  }
  return connected;
}

function connectWifi(res){

  resp = "Not connected to the copter. Attempting to connect to the ar-drone.  Please try again in 60 seconds."
  res.header('Content-Type', 'text/html');
  res.send(200,resp);

  var util = require('util'),
  spawn = require('child_process').spawn,
  sh = spawn('./utils/wifi.sh');

  sh.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  sh.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  sh.on('exit', function (code) {
    console.log('wifi shell exited with code ' + code);
  });
}

function sendResp(res,resp){
  console.log(resp);
  res.header('Content-Type', 'text/html');
  res.send(200,resp);
}

// configure the express app
var http = require('http');
var express = require('express');
var app = express();
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.errorHandler());
  app.use(app.router);
  app.use(function(err, req, res, next){
    res.status(500);
    res.render('error', { error: err });
  });
});

// create drone client
var arDrone = require('ar-drone');
var client  = arDrone.createClient();

// check the status of the drone
app.get('/status', function(req,res) {
  if(checkConnection()){
    var resp = 'Copter connected and ready for action.';
    client.animateLeds('blinkGreenRed',1,5000);
    sendResp(res,resp);
  } else {
    connectWifi(res);
  }
});

app.get('/victory', function(req,res) {
  if(checkConnection()){
    client.takeoff();
    client
      .after(5000, function() {
        this.clockwise(0.5);
      })
      .after(3000, function() {
        this.stop();
        this.land();
      });
  } else {
    connectWifi(res);
  }
});

// expose the built-in ar-drone methods as GETs
app.get('/takeoff', function(req,res) {
  if(checkConnection()){
    var resp = 'taking off...';
    client.takeoff();
    sendResp(res,resp);
  } else {
    connectWifi(res);
  }
});

app.get('/hover', function(req,res) {
  if(checkConnection()){
    var resp = 'commencing hover';
    client.stop();
    sendResp(res,resp);
  } else {
    connectWifi(res);
  }
});

app.get('/land', function(req,res) {
  if(checkConnection()){
    var resp = '...landing';
    client.land();
    sendResp(res,resp);
  } else {
    connectWifi(res);
  }
});

// expecting (up, down, left, right, forward, backward) and speed
app.get('/move', function(req,res) {
  if(checkConnection()){
    var resp = 'move (up,down,left,right,forward,backward) speed';
    sendResp(res,resp);
  } else {
    connectWifi(res);
  }
});

app.get('/move/:direction/:speed', function(req,res) {
  if(checkConnection()){
    var speed = parseInt(req.params.speed);
    var direction = req.params.direction;
    var resp = 'moving ' + direction + ' at speed ' + speed;
    var usage = 'move (up,down,left,right,forward,backward) speed';
    if(direction=='up'){
      client.up(speed);
    } else 
    if(direction=='down'){
      client.down(speed);
    } else
    if(direction=='left'){
      client.left(speed);
    } else
    if(direction=='right'){
      client.right(speed);
    } else
    if(direction=='forward'){
      client.front(speed);
    } else
    if(direction=='backward'){
      client.back(speed);
    } else {
      res.header('Content-Type', 'text/html');
      var resp = usage;
    }
    sendResp(res,resp);
  } else {
    connectWifi(res);
  }
});

// expecting (cw, ccw) and speed
app.get('/spin', function(req,res) {
  if(checkConnection()){
    var resp = 'spin (cw,ccw) speed';
    sendResp(res,resp);
  } else {
    connectWifi(res);
  }
});

app.get('/spin/:direction/:speed', function(req,res) {
  if(checkConnection()){
    var speed = parseInt(req.params.speed);
    var direction = req.params.direction;
    var usage = 'spin (cw,ccw) speed';
    if(direction=='cw'){
      var resp = 'spinning clockwise with speed ' + speed;
      client.clockwise(speed);
    } else 
    if(direction=='ccw'){
      var resp = 'spinning counter-clockwise with speed ' + speed;
      client.counterClockwise(speed);
    } else {
      var resp = usage;
    }
    sendResp(res,resp);
  } else {
    connectWifi(res);
  }
});

// expecting (the list of sequences) and duration
app.get('/animate', function(req,res) {
  if(checkConnection()){
    var sequences = ['phiM30Deg','phi30Deg','thetaM30Deg','theta30Deg','theta20degYaw200deg','theta20degYawM200deg','turnaround','turnaroundGodown','yawShake','yawDance','phiDance','thetaDance','vzDance','wave','phiThetaMixed','doublePhiThetaMixed','flipAhead','flipBehind','flipLeft','flipRight'];
    var resp = 'animate (' + sequences + ') duration(ms)';
    sendResp(res,resp);
  } else {
    connectWifi(res);
  }
});

app.get('/animate/:sequence/:duration', function(req,res) {
  if(checkConnection()){
    var duration = parseInt(req.params.duration);
    var sequence = req.params.sequence;
    var sequences = ['phiM30Deg','phi30Deg','thetaM30Deg','theta30Deg','theta20degYaw200deg','theta20degYawM200deg','turnaround','turnaroundGodown','yawShake','yawDance','phiDance','thetaDance','vzDance','wave','phiThetaMixed','doublePhiThetaMixed','flipAhead','flipBehind','flipLeft','flipRight'];
    var usage = 'animate (' + sequences + ') <duration(ms)>';
    var resp = 'animating with sequence ' + sequence + ' for duration ' + duration + ' ms';
    if(sequences.indexOf(sequence) >= 0){
      client.animate(sequence,duration);
    } else {
      var resp = usage;
    }
    sendResp(res,resp);
  } else {
    connectWifi(res);
  }
});

// expecting (the list of sequences), hertz and speed    
app.get('/leds', function(req,res) {
  if(checkConnection()){
    var sequences = ['blinkGreenRed','blinkGreen','blinkRed','blinkOrange','snakeGreenRed','fire','standard','red','green','redSnake','blank','rightMissile','leftMissile','doubleMissile','frontLeftGreenOthersRed','frontRightGreenOthersRed','rearRightGreenOthersRed','rearLeftGreenOthersRed','leftGreenRightRed','leftRedRightGreen','blinkStandard']
    var resp = 'leds (' + sequences + ') hz duration(ms)';
    sendResp(res,resp);
  } else {
    connectWifi(res);
  }
});

app.get('/leds/:sequence/:hz/:duration', function(req,res) {
  if(checkConnection()){
    var duration = parseInt(req.params.duration);
    var hz = parseInt(req.params.hz);
    var sequence = req.params.sequence;
    var sequences = ['blinkGreenRed','blinkGreen','blinkRed','blinkOrange','snakeGreenRed','fire','standard','red','green','redSnake','blank','rightMissile','leftMissile','doubleMissile','frontLeftGreenOthersRed','frontRightGreenOthersRed','rearRightGreenOthersRed','rearLeftGreenOthersRed','leftGreenRightRed','leftRedRightGreen','blinkStandard']
    var usage = 'leds (' + sequences + ') hz duration(ms)';
    var resp = 'animating leds with sequence ' + sequence + ' at ' + hz + ' hz for duration ' + duration + ' ms';
    if(sequences.indexOf(sequence) >= 0){
      client.animateLeds(sequence,hz,duration);
    } else {
      resp = usage;
    }
    sendResp(res,resp);
  } else {
    connectWifi(res); 
  }
});

app.get('/chillout', function(req,res) {
  if(checkConnection()){
    var resp = 'disabling emergency mode';
    client.disableEmergency();
    sendResp(res,resp);
  } else {
    connectWifi(res);
  }
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

process.on('uncaughtException', function(err) {
  console.log(err.stack);
});
