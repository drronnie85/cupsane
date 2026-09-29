# CUPSane Print & Scan Server

CUPS printing (with working AirPrint) and SANE scanning through the scanservjs
web UI, for the same USB or network multifunction device.

## Configuration

```yaml
log_level: info
cups_user: print
cups_password: print
brother_scanner: true
brother_net_devices: []
airscan_devices: []
saned_net_hosts: []
scanimage_list_ignore: false
devices: []
ocr_language: eng
```

### `log_level`

Verbosity of the add-on log and of scanservjs. `info` is a good default;
`debug` when a device is not detected.

### `cups_user` / `cups_password`

Account used to log into the CUPS admin interface on port 631. The user is
created on start and added to `lpadmin`, `lp`, `scanner` and `sudo`. Changing
`cups_user` creates an additional account — the previous one keeps working.

### `brother_scanner`

Enables Brother's `brscan4` and `brscan3` SANE backends (bundled as `.deb`s,
x86-64 only). `brscan3` covers older models `brscan4` does not know, such as
the DCP-7030/7040/7045N and MFC-7440N.
Turn it off if the backend upsets detection of a non-Brother scanner.

### `brother_net_devices`

Brother scanners reachable over the network, registered with `brsaneconfig4`.
One entry per device, in `brsaneconfig4 -a` syntax:

```yaml
brother_net_devices:
  - name=office model=MFC-L2710DW ip=192.168.1.50
```

Entries are re-registered on every start, so a changed IP is picked up.

### `airscan_devices`

Devices for `sane-airscan` (eSCL / AirScan / WSD) that autodiscovery misses —
this is the way to scan from a Brother or HP network MFP on `aarch64`:

```yaml
airscan_devices:
  - "Office MFP = http://192.168.1.50:80/eSCL"
```

### `saned_net_hosts`

Hosts running a remote `saned` to pull scanners from, one per entry.

### `scanimage_list_ignore`

Stop scanservjs from probing with `scanimage -L`. Useful when every device is
listed explicitly in `devices` and probing is slow or wakes the hardware.

### `devices`

Force a scanner device list instead of relying on detection, e.g.
`brother4:net1;dev0` or `airscan:e0:Office MFP`.

### `ocr_language`

Tesseract language for OCR output. All listed languages are already installed
in the image: `eng`, `ukr`, `rus`, `deu`, `fra`, `spa`, `ita`, `por`, `nld`,
`pol`.

## Storage

| Path | Contents |
| --- | --- |
| `/addon_configs/<slug>_cupsane/cups` | `cupsd.conf`, printer queues, PPDs |
| `/addon_configs/<slug>_cupsane/sane.d` | SANE backend configuration |
| `/share/cupsane/scans` | Scanned files |
| `/share/cupsane/pdf` | Output of the "Print to PDF" queue |

`cupsd.conf` is rendered once on the first start and then left alone — edit it
freely, or delete it and restart to get the generated one back. `net.conf` and
`airscan.conf` are the exception: they are rewritten from the options on every
start.

## Adding a printer

1. Open `http://<ha-ip>:631` → **Administration** → **Add Printer**.
2. Pick the device, tick **Share this printer** (this is what publishes it to
   AirPrint), choose the driver.
3. Print a test page.

Windows clients that cannot see the shared queue can add it by URL:
`http://<ha-ip>:631/printers/<queue-name>`.

## Troubleshooting

**Scanner not found.** Connect and power on the device before starting the
add-on; restart the add-on after replugging. Check the log for the
`scanimage`/`sane-find-scanner` output printed at start.

**Brother USB scanner silent on ARM.** `brscan3`/`brscan4` are x86-64 only. Use the
device's network eSCL interface through `airscan_devices` instead.

**AirPrint does not discover the queue.** The queue must be shared, and the
add-on needs *Host network* enabled (it is, by default). Avahi runs in
reflector mode so it can coexist with Home Assistant's own mDNS.

**Printing works, scanning stops mid-job (or vice versa).** Some MFPs cannot do
both at once over USB — wait for the running job to finish.
