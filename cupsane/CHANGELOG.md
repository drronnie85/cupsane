## 1.0.0

Initial release.

- CUPS print server with AirPrint discovery via Avahi in reflector mode,
  based on `homeassistant-addon-cups-airprint-sane-airscan`.
- Brother `brscan4` scanner driver bundled, as in `ha-scanservjs-addon`.
- Full printer driver set (Brother, HP, Canon, Epson, generic) from
  `homeassistant-addon-cups-airprint`, so the same device can print and scan.
- scanservjs 3.0.3 scan UI on port 8080, also exposed through Ingress.
- All drivers and OCR languages baked into the image — no package downloads at
  start-up.
- Configuration persisted in `/addon_configs`, scans in `/share/cupsane`.
