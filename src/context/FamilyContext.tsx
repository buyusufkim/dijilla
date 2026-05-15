import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";

export type FamilyMember = {
  id: string;
  name: string;
  role: "self" | "spouse" | "child" | "parent";
  avatarColor: string;
};

interface FamilyContextType {
  members: FamilyMember[];
  activeMember: FamilyMember | null;
  loading: boolean;
  setActiveMember: (member: FamilyMember | null) => void;
  addMember: (member: FamilyMember) => void;
  removeMember: (id: string) => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [activeMember, setActiveMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = user?.id || "";
  
  const scopedStorageKey = useMemo(() => `droto_family_members_${userId}`, [userId]);
  const scopedActiveKey = useMemo(() => `droto_active_member_id_${userId}`, [userId]);

  // Load data on mount or user change
  useEffect(() => {
    if (!user?.id) {
       setMembers([]);
       setActiveMember(null);
       setLoading(false);
       return;
    }

    const loadData = () => {
      setLoading(true);
      try {
        const storedMembers = localStorage.getItem(scopedStorageKey);
        const storedActiveId = localStorage.getItem(scopedActiveKey);

        let parsedMembers: FamilyMember[] = [];
        if (storedMembers) {
          const raw = JSON.parse(storedMembers);
          if (Array.isArray(raw)) {
            parsedMembers = raw.filter(member => {
              const isValid = 
                member &&
                typeof member.id === "string" &&
                typeof member.name === "string" &&
                ["self", "spouse", "child", "parent"].includes(member.role) &&
                typeof member.avatarColor === "string";
              return isValid;
            });
          }
        }

        setMembers(parsedMembers);

        if (storedActiveId && parsedMembers.length > 0) {
          const active = parsedMembers.find(m => m.id === storedActiveId);
          setActiveMember(active || parsedMembers[0]);
        } else if (parsedMembers.length > 0) {
          setActiveMember(parsedMembers[0]);
        } else {
          setActiveMember(null);
        }
      } catch (error) {
        console.error("Family data load error:", error);
        setMembers([]);
        setActiveMember(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, scopedStorageKey, scopedActiveKey]);

  // Persist members on change
  useEffect(() => {
    if (!loading && user?.id) {
      localStorage.setItem(scopedStorageKey, JSON.stringify(members));
    }
  }, [members, loading, scopedStorageKey, user?.id]);

  // Persist active member on change
  useEffect(() => {
    if (!loading && user?.id) {
      if (activeMember) {
        localStorage.setItem(scopedActiveKey, activeMember.id);
      } else {
        localStorage.removeItem(scopedActiveKey);
      }
    }
  }, [activeMember, loading, scopedActiveKey, user?.id]);

  const addMember = (member: FamilyMember) => {
    setMembers((prev) => [...prev, member]);
  };

  const removeMember = (id: string) => {
    setMembers((prev) => {
      const newMembers = prev.filter((m) => m.id !== id);
      if (activeMember?.id === id) {
        setActiveMember(newMembers[0] || null);
      }
      return newMembers;
    });
  };

  return (
    <FamilyContext.Provider value={{ members, activeMember, loading, setActiveMember, addMember, removeMember }}>
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
