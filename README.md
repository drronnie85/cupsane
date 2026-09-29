# CUPSane — Print & Scan add-on for Home Assistant

Turn the Home Assistant host into a network print **and** scan server for one and
the same multifunction device.

This repository is a merge of three existing add-ons:

| Source | What was taken |
| --- | --- |
| [`homeassistant-addon-cups-airprint-sane-airscan`](https://github.com/dete75/homeassistant-addon-cups-airprint-sane-airscan) | Overall layout — CUPS + SANE + scanservjs in one add-on, `tempio` config templates, ingress-exposed scan UI |
| [`ha-scanservjs-addon`](https://github.com/niallr/ha-scanservjs-addon) | The vendored Brother **brscan4** scanner driver and its SANE wiring |
| [`homeassistant-addon-cups-airprint`](https://github.com/zajac-grzegorz/homeassistant-addon-cups-airprint) | The printing half — full driver set, permissive `cupsd.conf` and Avahi in reflector mode, which is what makes AirPrint actually work |

## Installation

1. Settings → Add-ons → ⋮ → **Repositories** → add this repository URL.
2. Install **CUPSane Print & Scan Server**.
3. Connect the printer/scanner to the HA host, then start the add-on.

There is no prebuilt image — Supervisor builds it on the host the first time,
which takes a while (the full driver set is baked in so that later restarts need
no network access).

## Using it

- **Print server / admin**: `http://<ha-ip>:631` — log in with `cups_user` /
  `cups_password` (default `print` / `print`) to add a queue.
- **Scan UI**: the add-on's *Open Web UI* (ingress) or `http://<ha-ip>:8080`.
- **AirPrint**: iOS/macOS pick the queue up automatically once it is shared.
- **Windows**: add a printer by URL `http://<ha-ip>:631/printers/<queue-name>`.

Scans land in `/share/cupsane/scans`, "Print to PDF" output in
`/share/cupsane/pdf`. CUPS and SANE configuration lives in
`/addon_configs/<slug>_cupsane/` (`cups/` and `sane.d/`) so queues survive
updates.

## Printing and scanning from the same device

Both halves talk to the device independently and only while a job runs, so they
coexist:

- **USB** — CUPS uses its `usb://` backend, SANE uses `brother4`/`brother3` (Brother),
  `hpaio` (HP) or the generic backends.
- **Network** — CUPS uses `ipp://`/`socket://`, SANE uses `airscan` (eSCL/WSD),
  `brother4` over IP, or `net`.

`ipp-usb` is deliberately **not** installed: it claims the USB device
exclusively and would break the CUPS side on devices that also speak IPP-USB.

## Drivers included

- **Brother** — `brscan4` 0.4.11 and `brscan3` 0.2.13 for older models (scanning, x86-64 only), `printer-driver-brlaser`,
  Gutenprint, foo2zjs
- **HP** — HPLIP, `hpaio` SANE backend, `printer-driver-hpcups`, hpijs-ppds
- **Canon** — `cnijfilter2` 6.80
- **Epson** — `printer-driver-escpr`
- **Generic** — `printer-driver-all`, `openprinting-ppds`, Splix
- **Network scanning** — `sane-airscan` (eSCL / AirScan / WSD)

On `aarch64` Brother's `brscan4` is skipped — Brother only ships x86 binaries.
Use eSCL (`airscan_devices`) for Brother network MFPs on ARM.

See [`cupsane/DOCS.md`](cupsane/DOCS.md) for every configuration option.
