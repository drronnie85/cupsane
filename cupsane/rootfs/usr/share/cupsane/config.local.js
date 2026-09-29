// scanservjs local configuration, installed by the CUPSane add-on.
// Only the storage locations are overridden so scans survive add-on updates
// and show up under /share/cupsane/scans in Home Assistant.
module.exports = {
  afterConfig(config) {
    config.outputDirectory = '/share/cupsane/scans/';
    config.previewDirectory = '/tmp/scanservjs/';
  },
};
