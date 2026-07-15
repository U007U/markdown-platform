import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('handles conditional classes', () => {
    const result = cn('base', true && 'active', false && 'inactive');
    expect(result).toContain('base');
    expect(result).toContain('active');
    expect(result).not.toContain('inactive');
  });

  it('handles undefined and null', () => {
    const result = cn('base', undefined, null);
    expect(result).toBe('base');
  });

  it('handles empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });
});
