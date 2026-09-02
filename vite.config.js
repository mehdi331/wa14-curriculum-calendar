import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT for GitHub Pages: if this repo is deployed at
// https://<username>.github.io/<repo-name>/  (a normal project repo),
// set base to '/<repo-name>/' below. If it's deployed at the root of a
// custom domain, or as a <username>.github.io user/org page, leave it as '/'.
export default defineConfig({
  plugins: [react()],
  base: '/wa14-curriculum-calendar/', // <-- change to match your repo name
});
