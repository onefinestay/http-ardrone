var arDrone = require('ar-drone');
var client  = arDrone.createClient();
console.log(client);
client.createRepl();
