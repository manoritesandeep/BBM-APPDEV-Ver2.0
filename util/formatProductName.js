export function formatProductName(name) {
  return name.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}
