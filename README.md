http-ardrone
============
Control your ar-drone over http using this web server for the [ar-drone project](https://github.com/felixge/node-ar-drone).

Start the server
================
1. Set COPTER_NETWORK_IP in [copter.js](blob/master/copter.js).  This is the IP address your copter assigns when you join its wifi network.
2. Start the server as `node copter.js`

Usage
=====
Open the app in a web browser, e.g. `http://localhost:3000`. The app responds with expected usage:

`(takeoff,hover,land,move,animate,leds)`

Control the copter using any of the above commands.  To see additional usage, open the associated url, like `http://localhost:3000/move`:

`move (up,down,left,right,forward,backward) speed`

Examples
========
takeoff - http://localhost:3000/takeoff

move left at speed 10 - http://localhost:3000/move/left/10

blink Green/Red at 50 Hz for 8000 ms - http://localhost:3000/leds/blinkGreenRed/50/8000
