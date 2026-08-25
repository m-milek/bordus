# Bordus

Bordus is a lightweight, static dashboard designed for homelabs and personal start pages. It is configured entirely through a single YAML file and built for speed.

## Features

- Static Configuration: Everything is defined in a single `config.yaml` file. No backend or database required.
- Instant Loading: The application parses its configuration before React mounts, ensuring zero layout shift and instant rendering.
- Tiny Footprint: Provided as a multi-stage Docker image using BusyBox. The final image size is roughly 2MB.
- Live Updates: When using Docker, the configuration file is mounted as a volume. Changes to the YAML file reflect instantly upon page refresh without rebuilding the container.
- Search: Includes a built-in search bar to filter services by name or description.
- Theming: Automatic dark and light mode support based on system preferences, with a manual override toggle.
- Icon Support: Automatically resolves section icons using Lucide and service icons using the Homarr dashboard-icons repository.

## Installation

Bordus is designed to be run as a Docker container. 

1. Create a `docker-compose.yml` file:

```yaml
services:
  bordus:
    image: ghcr.io/yourusername/bordus:latest
    container_name: bordus
    ports:
      - "8080:8080"
    volumes:
      - ./config.yaml:/home/static/config.yaml:ro
    restart: unless-stopped
```

2. Create a `config.yaml` file in the same directory. See `config.example.yaml` in this repository for a full list of supported properties and options.

3. Start the container:

```bash
docker compose up -d
```
