// scanservjs local configuration, installed by the CUPSane add-on.
// Scans are stored in /share/cupsane/scans so they survive add-on updates and
// show up in Home Assistant; devices get the names scanimage -L reports.
const fs = require('fs');

const DEVICE_NAMES = '/tmp/scanservjs/device-names.json';

module.exports = {
  afterConfig(config) {
    config.outputDirectory = '/share/cupsane/scans/';
  },

  afterDevices(devices) {
    let names = {};
    try {
      names = JSON.parse(fs.readFileSync(DEVICE_NAMES, 'utf8'));
    } catch (e) {
      return;
    }
    for (const device of devices) {
      const name = (names[device.id] || '').trim();
      if (name) {
        device.name = name;
      }
    }
  },
};
