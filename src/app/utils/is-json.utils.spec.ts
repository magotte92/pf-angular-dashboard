import { isJson } from '@pf-app/utils';

describe('isJson', () => {
  it('should return true for valid JSON string', () => {
    const validJson = '{"name": "Bitcoin", "symbol": "BTC"}';
    expect(isJson(validJson)).toBe(true);
  });

  it('should return false for invalid JSON string', () => {
    const invalidJson = '{"name": "Bitcoin", "symbol": "BTC"';
    expect(isJson(invalidJson)).toBe(false);
  });

  it('should return false for non-JSON string', () => {
    const nonJson = 'Hello, World!';
    expect(isJson(nonJson)).toBe(false);
  });

  it('should return true for empty JSON object', () => {
    const emptyJsonObject = '{}';
    expect(isJson(emptyJsonObject)).toBe(true);
  });

  it('should return true for empty JSON array', () => {
    const emptyJsonArray = '[]';
    expect(isJson(emptyJsonArray)).toBe(true);
  });

  it('should return false for empty string', () => {
    const emptyString = '';
    expect(isJson(emptyString)).toBe(false);
  });

  it('should return false for string with only spaces', () => {
    const spacesString = '   ';
    expect(isJson(spacesString)).toBe(false);
  });
});
