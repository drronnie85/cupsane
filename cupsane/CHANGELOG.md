## 1.1.0

- Add AirSane 0.4.15, which publishes the SANE scanners as eSCL/AirScan
  devices over mDNS on port 8090. The Windows 10/11 Scan app, macOS Image
  Capture and Mopria Scan on Android can now scan from USB-only scanners such
  as the DCP-7030 without any drivers. Toggle with `airsane`; its
  configuration is kept in `/config/airsane`.
- The add-on's own `sane-airscan` blacklists the host's addresses, so scanners
  republished by AirSane are not listed twice in scanservjs.
- Disable the `escl` SANE backend; it duplicated `airscan` devices and is not
  compatible with AirSane.

## 1.0.4

- Show scanners by name ("Brother DCP-7030") instead of their SANE id
  ("brother3:bus2;dev3") in the scanservjs web UI.
- Fix `ENOENT … /tmp/scanservjs/default.png`: previews use scanservjs' own
  preview directory again, which ships the placeholder image.

## 1.0.3

- Fix "no devices found" in the scanservjs web UI: `SCANIMAGE_LIST_IGNORE` was
  exported as `false`, and scanservjs treats any non-empty value as "skip
  scanner discovery". It is now only set when the option is enabled.
- Clear the scanservjs device cache on start, so a replugged USB scanner with a
  new bus/device number is picked up.

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
