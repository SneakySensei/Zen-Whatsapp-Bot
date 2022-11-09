export function assertExists<T>(
  value: T | null | undefined,
  message: string = "Value does not exist!"
): T {
  if (!value || value == null) {
    throw new Error(message);
  }

  return value;
}
