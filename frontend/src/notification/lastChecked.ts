const sha256Hex = async (str: string) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str),
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
};

// hashed so the storage key does not reveal who the user is
export const bellStorageKey = async (sub: string, partyID: number | string) =>
  `notification-bell-checked:${await sha256Hex(`${sub}:${partyID}`)}`;

export const getLastChecked = (key: string): string | null => {
  try {
    const value = localStorage.getItem(key);
    return value && !isNaN(Date.parse(value)) ? value : null;
  } catch {
    return null;
  }
};

export const setLastChecked = (key: string, date: Date = new Date()) => {
  try {
    localStorage.setItem(key, date.toISOString());
  } catch {
    // localStorage unavailable
  }
};
