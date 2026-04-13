const STORAGE_SCOPE_KEY = "droto_data_scope";

const getScope = () => {
  if (typeof window === "undefined") return "guest";
  return localStorage.getItem(STORAGE_SCOPE_KEY) || "guest";
};

const getScopedTableKey = (table: string) => `droto_${getScope()}_${table}`;

export const setDataScope = (scope: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_SCOPE_KEY, scope);
};

export const clearDataScope = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_SCOPE_KEY);
};

export const getLocalData = (table: string) => {
  try {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(getScopedTableKey(table));
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("localStorage read error:", e);
    return [];
  }
};

export const setLocalData = (table: string, data: any[]) => {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(getScopedTableKey(table), JSON.stringify(data));
  } catch (e) {
    console.error("localStorage write error:", e);
  }
};

export const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};