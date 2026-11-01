import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../components/Api";

const NotificationContext = createContext();

// Simple notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error("Failed to play notification sound:", error);
  }
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const previousNotificationCount = useRef(0);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/notifications`);
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);
      setHasNotifications(data.some((item) => !item.read));

      // Play sound if new notification arrived
      if (data.length > previousNotificationCount.current && previousNotificationCount.current > 0) {
        playNotificationSound();
      }
      previousNotificationCount.current = data.length;
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
