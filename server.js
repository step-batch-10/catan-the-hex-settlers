import { createApp } from './src/app.js';
import { Catan } from './src/models/catan.ts';


const main = (port) => {
 const game = new Catan().mockGame();
 Deno.serve({ port }, createApp(game).fetch);
};

main(Deno.args[0] || 3000);
