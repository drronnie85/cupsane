## 1.0.2

- Fix `open of device brother3:… failed: Invalid argument`: `brscan3` loads its
  `libbrscandec3.so` decoder by its unversioned name when a scan starts, so the
  library is now linked into the default library directory.

## 1.0.1

- Bundle Brother `brscan3` 0.2.13 for older scanners that `brscan4` does not
  support (DCP-7030, DCP-7040, DCP-7045N, MFC-7440N, …). The backend is linked
  into Debian's multiarch SANE directory and gets `libusb-0.1`, which its own
  installer does not provide.

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
