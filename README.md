# vp-setup-exe-downloader

Download redirector for the Vite+ Windows installer. Auto-detects CPU architecture and redirects to the correct GitHub release asset.

## Endpoints

### `GET /`

Redirects to the [Vite+ installation guide](https://viteplus.dev/guide/#install-vp).

### `GET /download`

Redirects to the latest `vp-setup.exe` GitHub release asset.

**Query parameters:**

| Param  | Description                                      | Example                |
| ------ | ------------------------------------------------ | ---------------------- |
| `arch` | Override architecture detection (`x64`, `arm64`) | `?arch=arm64`          |
| `tag`  | Pin to a specific release tag                    | `?tag=v0.1.17-alpha.0` |

**Architecture detection:**

1. `?arch=` query parameter (explicit override)
2. `User-Agent` header (detects `ARM64`/`aarch64`)
3. Defaults to `x64`

## Development

```bash
vp install
vp dev        # start dev server
vp check      # format, lint, type check
vp test       # run tests
```

## Deployment

Deployed to [Cloudflare Workers](https://workers.cloudflare.com/) via [Void](https://void.cloud). Pushes to `main` trigger automatic deployment.

### Environment variables

| Variable       | Required | Description                                                |
| -------------- | -------- | ---------------------------------------------------------- |
| `GITHUB_TOKEN` | No       | GitHub token for higher API rate limits (60/hr -> 5000/hr) |
| `VOID_TOKEN`   | Yes (CI) | Void deployment token                                      |
