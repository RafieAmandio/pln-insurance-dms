import { describe, it, expect } from 'vitest';

describe('Vitest Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should support TypeScript', () => {
    const value: string = 'hello';
    expect(value).toBe('hello');
  });

  it('should have jest-dom matchers available', () => {
    const div = document.createElement('div');
    div.textContent = 'test';
    document.body.appendChild(div);
    expect(div).toBeInTheDocument();
    document.body.removeChild(div);
  });
});
