import React, { useState } from "react";
import { BellRing, Trash2, CheckSquare, Square } from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

const NotificationsPage = () => {
  const { notifications, loading, removeNotifications, clearAllNotifications } = useNotification();
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClearSelected = async () => {
    if (!selectedIds.length) return;
    await removeNotifications(selectedIds);
    setSelectedIds([]);
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    setSelectedIds([]);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">Manage admin alerts for new website orders and activity.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClearSelected}
            disabled={!selectedIds.length}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear Selected
          </button>
          <button
            onClick={handleClearAll}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <div className="py-10 text-center text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
            <BellRing size={28} />
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const selected = selectedIds.includes(notification._id);
              return (
                <div key={notification._id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
                  <button onClick={() => toggleSelection(notification._id)} className="mt-1 text-slate-500">
                    {selected ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                      <span className="text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                  </div>
                  <button
                    onClick={() => removeNotifications([notification._id])}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-red-600"
                    title="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
