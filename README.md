# Bordus

Bordus is a lightweight, static dashboard designed for homelabs and personal start pages. It is configured entirely through a single YAML file and built for speed.

## Features

- Static Configuration: Everything is defined in a single `config.yaml` file. No backend or database required.
- Instant Loading: No webfonts and no external requests on the critical path. The config request starts while the document is still parsing, so it arrives alongside the bundle rather than a round trip after it.
- Tiny Footprint: Built as a multi-stage Docker image served by nginx. Assets are precompressed at build time and served with `gzip_static`.
- Live Updates: When using Docker, the configuration file is mounted as a volume. Changes to the YAML file reflect instantly upon page refresh without rebuilding the container.
- Categories: Services are grouped into categories, each a single resizable element on the grid with a coloured frame and a floating title pill. Frames are drawn into the gutter between tiles, so a tile sits the same distance from its neighbour whether or not they share a category.
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
      - "1918:1918"
    volumes:
      - ./config.yaml:/usr/share/nginx/html/config.yaml:ro
    restart: unless-stopped
```

2. Create a `config.yaml` file in the same directory. See `config.example.yaml` in this repository for a full list of supported properties and options.

### Arranging the grid

Categories are laid out automatically, but you can size and place them yourself. All values are in tile units:

| Key | Meaning |
| --- | --- |
| `w` | Category width in tile columns. Clamped to the columns available at the current breakpoint. Defaults to 4 on wide screens, narrowing with the layout. |
| `rows` | How many tile rows are visible. Anything beyond scrolls inside the category, a whole row at a time, so a tile is never cut in half. Defaults to whatever fits, up to 3. |
| `layout` | Per-breakpoint overrides of `w` and `rows`, plus an explicit `x`/`y` position. Breakpoints are `lg`, `md`, `sm`, `xs` and `xxs`. |

```yaml
categories:
  - name: "Media"
    color: "blue"
    icon: "play"
    w: 6
    rows: 2
    layout:
      md: { w: 3 }
    services:
      - name: "Plex"
        url: "http://plex.local:32400"
```

You can also arrange everything by hand. Open the settings widget, switch on edit mode, then drag categories by their title pill and tiles by the handle that appears when you hover one. Resizing a category snaps to whole tile rows.

Edit-mode changes are saved in your browser. To make them permanent for everyone, press the copy button in edit mode and paste the resulting `gridLayout:` block into your `config.yaml`. Config is the fallback; anything saved in the browser wins until you reset the layout.

3. Start the container:

```bash
docker compose up -d
```
