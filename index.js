var Service;
var Characteristic;

var ssh = require('ssh-exec');
var assign = require('object-assign');

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-classe100x', 'CLASSE100X', C100XAccessory);
}

function C100CAccessory(log, config) {
  this.log = log;
  this.service = 'Switch';

  this.name = config['name'];
  this.command = "echo *8*19*20## |nc 0 30006; sleep 1; echo *8*20*20##|nc 0 30006";

  this.manifacturer = config['manifacturer'] || "Bticino";
  this.model = config['model'] || "Classe100X";
  this.serialNumber = config['serialNumber'] || "CLASSE100X";

  this.ssh = assign({
    user: config['user'] || "root2",
    host: config['host'],
    password: config['password'] || "pwned123"
  }, config['ssh']);
}

C100CAccessory.prototype.setState = function(state, callback) {
  var accessory = this;
  var stream = ssh(command, accessory.command);

  stream.on('error', function (err) {
    accessory.log('Error: ' + err);
    callback(err || new Error('Error setting ' + accessory.name + ' to ' + state));
  });

  stream.on('finish', function () {
    accessory.log('Set ' + accessory.name + ' to ' + state);
    callback(null);
  });
}

C100CAccessory.prototype.getState = function(callback) {
  callback(null, false);
}

C100CAccessory.prototype.getServices = function() {
  var accessory = this;
  var informationService = new Service.AccessoryInformation();
  var switchService = new Service.Switch(accessory.name);

  informationService
  .setCharacteristic(Characteristic.Manufacturer, accessory.manifacturer)
  .setCharacteristic(Characteristic.Model, accessory.model)
  .setCharacteristic(Characteristic.SerialNumber, accessory.serialNumber);

  var characteristic = switchService.getCharacteristic(Characteristic.On)
  .on('set', this.setState.bind(accessory));

  characteristic.on('get', this.getState.bind(accessory))

  return [switchService];
}
