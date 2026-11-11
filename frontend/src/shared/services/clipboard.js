export async function writeClipboard(value) {
  return navigator.clipboard.writeText(value);
}
