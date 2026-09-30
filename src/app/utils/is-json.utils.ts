export function isJson(value: string) {
  try {
    JSON.parse(value);
  } catch {
    return false;
  }
  return true;
}
