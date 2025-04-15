import { assertEquals } from 'jsr:@std/assert';
import { describe, it } from 'jsr:@std/testing/bdd';
import { createApp } from '../src/app.js';

describe('app test', () => {
  it('should give status code 200', async () => {
    const app = createApp();
    const response = await app.request('/ok');
    assertEquals(response.status, 200);
  });
});
