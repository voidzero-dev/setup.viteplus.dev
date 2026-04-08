# vp-setup-exe-downloader

Download page and redirector for the Vite+ Windows installer. Serves a landing page that auto-detects CPU architecture using [UA Client Hints](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/getHighEntropyValues) and links to the correct GitHub release asset.

## Endpoints

### `GET /`

Serves the download page with client-side architecture detection.

- On Windows ARM64 browsers (Chrome/Edge 90+), the main download button automatically points to the ARM64 installer.
- On all other browsers, defaults to the x64 installer.
- A secondary link for the alternative architecture is always visible.

**Query parameters:**

| Param  | Description                                          | Example                |
| ------ | ---------------------------------------------------- | ---------------------- |
| `arch` | Skip the page and redirect directly (`x64`, `arm64`) | `?arch=arm64`          |
| `tag`  | Pin to a specific release tag                        | `?tag=v0.1.17-alpha.0` |

When `?arch=` is provided, the endpoint returns a 302 redirect instead of the HTML page (useful for CLI/curl).

### `GET /favicon.ico`

Redirects to the Vite+ favicon.

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
