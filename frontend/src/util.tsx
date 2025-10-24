// split an array into chunks of given size
export function chunksOf(size: number, t: any[]): any[][] {
  const chunks = [];
  for (let i = 0; i < t.length; i += size) {
    chunks.push(t.slice(i, i + size));
  }
  return chunks;
}

// remove suffix from a string
export const removeSuffix = (suffix: string, str: string): string =>
  str.endsWith(suffix) ? str.slice(0, -suffix.length) : str;

// capitalize the first letter of a string
export const capitaliseFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
