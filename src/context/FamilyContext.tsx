import React, { createContext, useContext, useState } from "react";

export type FamilyMember = {
  id: string;
  name: string;
  role: "self" | "spouse" | "child" | "parent";
  avatarColor: string;
};

interface FamilyContextType {
  members: FamilyMember[];
  activeMember: FamilyMember;
  setActiveMember: (member: FamilyMember) => void;
  addMember: (member: FamilyMember) => void;
}

const defaultMembers: FamilyMember[] = [
  { id: "1", name: "Ahmet Yılmaz", role: "self", avatarColor: "from-[#00E5FF] to-blue-600" },
  { id: "2", name: "Ayşe Yılmaz", role: "spouse", avatarColor: "from-purple-500 to-pink-500" },
  { id: "3", name: "Can Yılmaz", role: "child", avatarColor: "from-[#00E676] to-emerald-600" },
];

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<FamilyMember[]>(defaultMembers);
  const [activeMember, setActiveMember] = useState<FamilyMember>(defaultMembers[0]);

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
