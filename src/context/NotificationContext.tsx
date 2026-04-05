import React, { createContext, useContext, useState, useEffect } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  date: Date;
  read: boolean;
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, "id" | "date" | "read">) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Poliçe Yenileme Hatırlatması",
      message: "34 ABC 123 plakalı aracınızın kaskosu 15 gün içinde sona erecektir. Yenilemek için tıklayın.",
      type: "warning",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      link: "/insurance",
    },
    {
      id: "2",
      title: "Muayene Yaklaşıyor",
      message: "Aracınızın muayene tarihi 10 gün sonra. Randevu almayı unutmayın.",
      type: "info",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: false,
      link: "/services",
    },
    {
      id: "3",
      title: "Yeni Hizmet: Yol Yardım+",
      message: "Artık tüm Türkiye'de 7/24 yol yardım hizmetimiz aktif!",
      type: "success",
      date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      read: true,
    }
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification = (n: Omit<Notification, "id" | "date" | "read">) => {
    const newNotification: Notification = {
      ...n,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
