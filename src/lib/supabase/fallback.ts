export const getLocalData = (table: string) => {
  try {
    const data = localStorage.getItem(`droto_${table}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("localStorage read error:", e);
    return [];
  }
};

export const setLocalData = (table: string, data: any[]) => {
  try {
    localStorage.setItem(`droto_${table}`, JSON.stringify(data));
  } catch (e) {
    console.error("localStorage write error:", e);
  }
};

export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
