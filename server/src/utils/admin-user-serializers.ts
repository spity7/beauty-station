export function toIsoString(value: Date | string | undefined): string {
  if (!value) {
    return new Date(0).toISOString();
  }
  return value instanceof Date
    ? value.toISOString()
    : new Date(value).toISOString();
}
