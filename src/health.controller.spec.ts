import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns an ok health response', () => {
    const response = new HealthController().getHealth();

    expect(response.status).toBe('ok');
    expect(response.service).toBe('linkshub-api');
    expect(response.timestamp).toEqual(expect.any(String));
  });
});
