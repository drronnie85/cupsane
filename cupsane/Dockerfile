ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base-debian:bookworm

# --- AirSane: SANE scanners as eSCL/AirScan for Windows, macOS, iOS, Android --
# Not packaged for Debian bookworm, so it is compiled here and only the binary
# and its default config are copied into the add-on image.
FROM ${BUILD_FROM} AS airsane-build

ARG AIRSANE_VERSION="0.4.15"

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# AirSane reads one scan line per sane_read(); Brother's brscan3 answers such
# small reads with SANE_STATUS_NO_MEM, so reads are staged through 64 KiB.
COPY airsane-read-buffer.patch /tmp/airsane-read-buffer.patch

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates curl cmake make g++ patch \
        libsane-dev libjpeg-dev libpng-dev libavahi-client-dev libusb-1.0-0-dev \
    && curl -fsSL "https://github.com/SimulPiscator/AirSane/archive/refs/tags/v${AIRSANE_VERSION}.tar.gz" \
        | tar -xz -C /tmp \
    && patch -d "/tmp/AirSane-${AIRSANE_VERSION}" -p1 < /tmp/airsane-read-buffer.patch \
    && cmake -S "/tmp/AirSane-${AIRSANE_VERSION}" -B /tmp/airsane-build \
        -DCMAKE_BUILD_TYPE=MinSizeRel \
    && make -C /tmp/airsane-build -j"$(nproc)" \
    && mkdir -p /out/usr/local/bin /out/etc/airsane \
    && install -m 755 /tmp/airsane-build/airsaned /out/usr/local/bin/airsaned \
    && cp "/tmp/AirSane-${AIRSANE_VERSION}"/etc/* /out/etc/airsane/

# --- The add-on image ---------------------------------------------------------
FROM ${BUILD_FROM}

ARG ADDON_VERSION="dev"
ARG BRSCAN3_VERSION="0.2.13-1"
ARG BRSCAN4_VERSION="0.4.11-1"
ARG SCANSERVJS_VERSION="3.0.3"
ARG CNIJFILTER2_VERSION="6.80-1"

LABEL io.hass.version="${ADDON_VERSION}" \
      io.hass.type="addon" \
      io.hass.arch="amd64|aarch64" \
      org.opencontainers.image.version="${ADDON_VERSION}"

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ENV DEBIAN_FRONTEND=noninteractive \
    LANG=C.UTF-8 \
    NODE_ENV=production

RUN echo 'APT::Install-Recommends "false";' > /etc/apt/apt.conf.d/99no-recommends \
    && echo 'APT::Install-Suggests "false";' >> /etc/apt/apt.conf.d/99no-recommends

# Printing (CUPS + drivers), discovery (avahi), scanning (SANE) and OCR.
# Everything is installed at build time so the add-on starts without network
# access and behaves identically on every restart.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        sudo \
        locales \
        procps \
        nano \
        curl \
        ca-certificates \
        netcat-openbsd \
        usbutils \
        cups \
        cups-client \
        cups-filters \
        cups-pdf \
        colord \
        printer-driver-all-enforce \
        printer-driver-brlaser \
        printer-driver-splix \
        printer-driver-gutenprint \
        printer-driver-foo2zjs \
        printer-driver-hpcups \
        printer-driver-escpr \
        hplip \
        avahi-daemon \
        avahi-utils \
        libnss-mdns \
        dbus \
        sane-utils \
        libsane-common \
        sane-airscan \
        imagemagick \
        nodejs \
        tesseract-ocr \
        tesseract-ocr-osd \
        tesseract-ocr-eng \
        tesseract-ocr-ukr \
        tesseract-ocr-rus \
        tesseract-ocr-deu \
        tesseract-ocr-fra \
        tesseract-ocr-spa \
        tesseract-ocr-ita \
        tesseract-ocr-por \
        tesseract-ocr-nld \
        tesseract-ocr-pol \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Large PPD collections. Some of them sit outside Debian main, so they are
# installed best-effort rather than failing the whole build.
RUN apt-get update \
    && for pkg in printer-driver-all openprinting-ppds hpijs-ppds hp-ppd; do \
        if apt-get install -y --no-install-recommends "${pkg}"; then \
            echo "installed ${pkg}"; \
        else \
            echo "WARNING: ${pkg} unavailable on this base image, skipping"; \
        fi; \
    done \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# scanservjs - web scanning UI on top of SANE
RUN curl -fsSL -o /tmp/scanservjs.deb \
        "https://github.com/sbs20/scanservjs/releases/download/v${SCANSERVJS_VERSION}/scanservjs_${SCANSERVJS_VERSION}-1_all.deb" \
    && apt-get update \
    && apt-get install -y --no-install-recommends /tmp/scanservjs.deb \
    && apt-get clean \
    && rm -rf /tmp/scanservjs.deb /var/lib/apt/lists/*

# Brother scanner backend (brscan4), the driver bundled by ha-scanservjs-addon.
# Brother only ships x86 builds, so it is skipped on aarch64 - those machines
# fall back to sane-airscan (eSCL/WSD) for the very same Brother device.
COPY brscan4-${BRSCAN4_VERSION}.amd64.deb /tmp/brscan4.deb
RUN if [ "$(dpkg --print-architecture)" = "amd64" ]; then \
        apt-get update \
        && apt-get install -y --no-install-recommends /tmp/brscan4.deb \
        && apt-get clean && rm -rf /var/lib/apt/lists/*; \
    else \
        echo "brscan4 is x86-only, skipping on $(dpkg --print-architecture)"; \
    fi \
    && rm -f /tmp/brscan4.deb

# Brother brscan3 for older models brscan4 does not know (DCP-7030/7040/7045N,
# MFC-7440N, …). Its postinst only links into /usr/lib/sane, while Debian's
# SANE loads backends from the multiarch dir. It also needs libusb-0.1, and it
# dlopen()s the unversioned "libbrscandec3.so" only when a device is opened,
# so that name must sit in a default library dir - all fixed up here.
COPY brscan3-${BRSCAN3_VERSION}.amd64.deb /tmp/brscan3.deb
RUN if [ "$(dpkg --print-architecture)" = "amd64" ]; then \
        apt-get update \
        && apt-get install -y --no-install-recommends libusb-0.1-4 /tmp/brscan3.deb \
        && apt-get clean && rm -rf /var/lib/apt/lists/* \
        && SANE_LIB="/usr/lib/x86_64-linux-gnu/sane" \
        && for so in libsane-brother3.so libsane-brother3.so.1 libsane-brother3.so.1.0.7; do \
            ln -sfn /usr/lib64/sane/libsane-brother3.so.1.0.7 "${SANE_LIB}/${so}"; \
        done \
        && for so in libbrscandec3.so libbrscandec3.so.1 libbrscandec3.so.1.0.0; do \
            ln -sfn /usr/lib64/libbrscandec3.so.1.0.0 "/usr/lib/x86_64-linux-gnu/${so}"; \
        done \
        && ldconfig \
        && ldd "${SANE_LIB}/libsane-brother3.so.1" | { ! grep "not found"; } \
        && test -e /usr/lib/x86_64-linux-gnu/libbrscandec3.so; \
    else \
        echo "brscan3 is x86-only, skipping on $(dpkg --print-architecture)"; \
    fi \
    && rm -f /tmp/brscan3.deb

# Canon cnijfilter2, fetched from Canon. Best-effort: the vendor URL is outside
# our control and the rest of the add-on works without it.
RUN cd /tmp \
    && if [ "$(dpkg --print-architecture)" = "amd64" ]; then CNIJ_ARCH="amd64"; else CNIJ_ARCH="arm64"; fi \
    && apt-get update \
    && { curl -fsSL -o cnijfilter2.tar.gz \
            "https://gdlp01.c-wss.com/gds/0/0100012300/02/cnijfilter2-${CNIJFILTER2_VERSION}-deb.tar.gz" \
        && tar -xf cnijfilter2.tar.gz \
            "cnijfilter2-${CNIJFILTER2_VERSION}-deb/packages/cnijfilter2_${CNIJFILTER2_VERSION}_${CNIJ_ARCH}.deb" \
        && apt-get install -y --no-install-recommends \
            "./cnijfilter2-${CNIJFILTER2_VERSION}-deb/packages/cnijfilter2_${CNIJFILTER2_VERSION}_${CNIJ_ARCH}.deb" \
        || echo "WARNING: Canon cnijfilter2 could not be installed, continuing without it"; } \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/cnijfilter2*

# AirSane, built above; its runtime libraries are all pulled in by SANE,
# Avahi and ImageMagick already, which ldd double-checks.
COPY --from=airsane-build /out /
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libavahi-client3 libjpeg62-turbo libpng16-16 libusb-1.0-0 \
    && apt-get clean && rm -rf /var/lib/apt/lists/* \
    && ldd /usr/local/bin/airsaned | { ! grep "not found"; }

COPY rootfs /

# Default CUPS admin account; the configured one is created/updated at runtime.
RUN groupadd -f scanner \
    && groupadd -f lpadmin \
    && useradd --groups=sudo,lp,lpadmin,scanner \
        --create-home --home-dir=/home/print --shell=/bin/bash print \
    && echo 'print:print' | chpasswd \
    && sed -i '/%sudo[[:space:]]/ s/ALL[[:space:]]*$/NOPASSWD:ALL/' /etc/sudoers \
    && find /etc/s6-overlay/s6-rc.d -type f \( -name run -o -name finish -o -name up \) -exec chmod a+x {} + \
    && rm -rf /usr/share/doc/* /usr/share/man/* /var/tmp/* /root/.cache

EXPOSE 631 8080 8090
