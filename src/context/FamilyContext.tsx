import React, { createContext, useContext, useState } from "react";

export type FamilyMember = {
  id: string;
  name: string;
  role: "self" | "spouse" | "child" | "parent";
  avatarColor: string;
};

interface FamilyContextType {
  members: FamilyMember[];
  activeMember: FamilyMember | null;
  setActiveMember: (member: FamilyMember | null) => void;
  addMember: (member: FamilyMember) => void;
}

const defaultMembers: FamilyMember[] = [];

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<FamilyMember[]>(defaultMembers);
const [activeMember, setActiveMember] = useState<FamilyMember | null>(defaultMembers[0] ?? null);

  const addMember = (member: FamilyMember) => {
    setMembers((prev) => [...prev, member]);
  };

  return (
    <FamilyContext.Provider value={{ members, activeMember, setActiveMember, addMember }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error("useFamily must be used within a FamilyProvider");
  }
  return context;
}
