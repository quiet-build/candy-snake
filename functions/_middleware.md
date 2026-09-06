# Legacy host redirect

Cloudflare Pages runs `_middleware.ts` before every static asset. Only `snake.playminiarcade.com` redirects to the fixed main-site Candy Snake route; Pages, preview and local hosts pass through unchanged so component assets remain available.

Run `node --test tests/redirect.test.mjs` after changing the host or destination.
