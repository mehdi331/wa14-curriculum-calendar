import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from 'unocss/vite';
import fs from 'fs';
import path from 'path';

// Dev-only: serve the local test-account fixtures (gitignored at repo root)
// only while the dev server runs. On build this plugin does nothing, so the
// file is never copied into dist/ and never reaches GitHub Pages.
function devTestAccountsPlugin() {
  const fileName = 'local-test-accounts.json';
  const rootFile = path.resolve(process.cwd(), fileName);
  return {
    name: 'dev-test-accounts',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/' + fileName) return next();
        try {
          if (!fs.existsSync(rootFile)) { res.statusCode = 404; res.end('not found'); return; }
          const body = fs.readFileSync(rootFile);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(body);
        } catch (e) { res.statusCode = 500; res.end(String(e)); }
      });
    },
  };
}

// IMPORTANT for GitHub Pages: if this repo is deployed at
// https://<username>.github.io/<repo-name>/  (a normal project repo),
// set base to '/<repo-name>/' below. If it's deployed at the root of a
// custom domain, or as a <username>.github.io user/org page, leave it as '/'.
export default defineConfig({
  plugins: [react(), UnoCSS(), devTestAccountsPlugin()],
  base: '/wa14-curriculum-calendar/', // <-- change to match your repo name
});
