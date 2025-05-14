const request = require('supertest');
const app = require('./index');

describe('GET /hello', () => {
  it('should return Hello SonarQube!', async () => {
    const res = await request(app).get('/hello');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello SonarQube!');
  });
});

describe('GET /vuln', () => {
  it('should merge input JSON', async () => {
    const res = await request(app).get('/vuln?input={"a":{"b":1}}');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ a: { b: 1 } });
  });

  it('should handle invalid JSON input', async () => {
    const res = await request(app).get('/vuln?input=notjson');
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /xss', () => {
  it('should return HTML with injected name', async () => {
    const res = await request(app).get('/xss?name=test');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<h1>Hello test</h1>');
  });
});
