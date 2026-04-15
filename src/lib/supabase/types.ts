export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  getIdToken: () => Promise<string | null>;
};

export type AuthListener = (user: User | null) => void;
