import { createApp } from './src/app.js';

const main = (port) => {
  Deno.serve({ port }, createApp().fetch);
};

main(Deno.args[0] || 3000);
