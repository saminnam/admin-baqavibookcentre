import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../components/Api";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/notifications`);
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);
      setHasNotifications(data.some((item) => !item.read));
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 8000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  const removeNotifications = async (ids = []) => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications`, { data: { ids } });
      const updated = notifications.filter((item) => !ids.includes(item._id));
      setNotifications(updated);
      setHasNotifications(updated.some((item) => !item.read));
    } catch (error) {
      console.error("Failed to clear notifications", error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications`, { data: { all: true } });
      setNotifications([]);
      setHasNotifications(false);
    } catch (error) {
      console.error("Failed to clear all notifications", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        hasNotifications,
        loading,
        setHasNotifications,
        loadNotifications,
        removeNotifications,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
