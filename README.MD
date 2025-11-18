# failfalre

**Automatic Cloudflare proxy failover utility**
Monitors your domains and automatically disables/enables Cloudflare proxy or updates zone/record settings when Cloudflare is down.

---

## Features

* Monitors multiple domains and subdomains.
* Detects Cloudflare downtime via HTTP status.
* Automatically toggles proxy settings or other Cloudflare zone/record settings.
* Configurable via YAML file.
* Secure: Cloudflare API token is read from environment variable.
* Written in TypeScript with a clean, modular design.
* CLI utility that can run continuously.

---

## Installation

```bash
# Clone the repo
git clone https://github.com/kasper24/failfalre.git
cd failfalre

# Install dependencies
npm install

# Build TypeScript
npm run build

# Set Cloudflare API token
export CF_TOKEN=your_cloudflare_api_token

# Run CLI
npm start
```

Optional: run directly in development mode:

```bash
npm run dev
```

---

## Usage

```bash
failfalre
```

The CLI will:

1. Read `config.yaml` from the current working directory.
2. Monitor each domain at the configured interval.
3. Apply settings when Cloudflare is down or back up.

---

## Configuration

Create a `config.yaml` in the project root:

```yaml
interval: 60000  # check interval in milliseconds
domains:
  - domain: example.com
    on_cloudflare_down:
      set:
        paused: true
    on_cloudflare_up:
      set:
        paused: false
    records:
      - name: admin.example.com
        type: A
        on_cloudflare_down:
          set:
            proxy: false
        on_cloudflare_up:
          set:
            proxy: true
```

### Configuration Fields

* `interval` – optional; default `60000` ms (1 minute).
* `domain` – main domain to monitor.
* `on_cloudflare_down` / `on_cloudflare_up` – settings to apply when CF is down/up.
* `records` – optional list of subdomains/records to modify with `proxy`, `content`, etc.

---

## Environment Variables

* `CF_TOKEN` – Cloudflare API token. Must be set before running.

```bash
export CF_TOKEN=your_cloudflare_api_token
```

---

## Project Structure

```
src/
├── index.ts        # CLI entry
├── config.ts       # Load/validate config
├── utils.ts        # sleep(), httpStatus()
├── cloudflare.ts   # Cloudflare API functions
└── runner.ts       # Main loop and domain checks
```

---

## License

MIT License

