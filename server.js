import { createApp } from './src/app.ts';
import _ from 'lodash';
import { SessionStore } from './src/models/sessions.ts';

const main = (port) => {
  const sessions = new SessionStore();
  Deno.serve({ port }, createApp(sessions).fetch);
};

main(Deno.args[0] || 3000);
