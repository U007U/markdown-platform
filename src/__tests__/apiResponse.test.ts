/**
 * @jest-environment node
 */
import { NextResponse } from 'next/server';
import { ApiResponseBuilder } from '@/lib/api/response';

describe('ApiResponseBuilder', () => {
  it('creates success response', async () => {
    const response = ApiResponseBuilder.success({ id: 1, name: 'Test' });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.data).toEqual({ id: 1, name: 'Test' });
  });

  it('creates success response with meta', async () => {
    const response = ApiResponseBuilder.success(
      { id: 1 },
      { page: 1, limit: 10, total: 50, totalPages: 5 }
    );
    const data = await response.json();

    expect(data.meta?.page).toBe(1);
    expect(data.meta?.totalPages).toBe(5);
  });

  it('creates created response with status 201', async () => {
    const response = ApiResponseBuilder.created({ id: 1 });
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(response.status).toBe(201);
  });

  it('creates error response with status 400', async () => {
    const response = ApiResponseBuilder.error('Bad request');
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.message).toBe('Bad request');
    expect(response.status).toBe(400);
  });

  it('creates error with custom status', async () => {
    const response = ApiResponseBuilder.error('Server error', 500);
    expect(response.status).toBe(500);
  });

  it('creates unauthorized response with status 401', async () => {
    const response = ApiResponseBuilder.unauthorized();
    expect(response.status).toBe(401);
  });

  it('creates forbidden response with status 403', async () => {
    const response = ApiResponseBuilder.forbidden();
    expect(response.status).toBe(403);
  });

  it('creates not found response with status 404', async () => {
    const response = ApiResponseBuilder.notFound();
    expect(response.status).toBe(404);
  });

  it('creates too many requests response with status 429', async () => {
    const response = ApiResponseBuilder.tooManyRequests();
    expect(response.status).toBe(429);
  });

  it('creates paginated response', async () => {
    const response = ApiResponseBuilder.paginated(
      [{ id: 1 }, { id: 2 }],
      100,
      1,
      10
    );
    const data = await response.json();

    expect(data.data).toHaveLength(2);
    expect(data.meta?.total).toBe(100);
    expect(data.meta?.totalPages).toBe(10);
  });
});
