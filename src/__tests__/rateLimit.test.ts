import { RateLimiter } from '@/lib/security/rateLimit';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter(null, {
      windowMs: 1000, // 1 second window
      maxRequests: 3,
      keyPrefix: 'test',
    });
  });

  it('allows requests within limit', async () => {
    const result1 = await limiter.check('user1');
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = await limiter.check('user1');
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = await limiter.check('user1');
    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it('blocks requests over limit', async () => {
    await limiter.check('user1');
    await limiter.check('user1');
    await limiter.check('user1');

    const result = await limiter.check('user1');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('tracks different identifiers separately', async () => {
    await limiter.check('user1');
    await limiter.check('user1');
    await limiter.check('user1');

    const user2Result = await limiter.check('user2');
    expect(user2Result.allowed).toBe(true);
    expect(user2Result.remaining).toBe(2);
  });

  it('resets after window expires', async () => {
    const shortLimiter = new RateLimiter(null, {
      windowMs: 50,
      maxRequests: 2,
      keyPrefix: 'test-short',
    });

    await shortLimiter.check('user1');
    await shortLimiter.check('user1');

    const blocked = await shortLimiter.check('user1');
    expect(blocked.allowed).toBe(false);

    await new Promise(resolve => setTimeout(resolve, 100));

    const allowed = await shortLimiter.check('user1');
    expect(allowed.allowed).toBe(true);
  });

  it('resets explicitly', async () => {
    await limiter.check('user1');
    await limiter.check('user1');

    await limiter.reset('user1');

    const result = await limiter.check('user1');
    expect(result.remaining).toBe(2);
  });
});
