import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RiMenuFoldLine } from "react-icons/ri";
import { FaRegBell } from "react-icons/fa";
import { CgLogOut } from "react-icons/cg";
import { useNotification } from "../context/NotificationContext";

const MainContent = ({
  sidebarExpanded,
  setSidebarExpanded,
  hoveringSidebar,
  children,
}) => {
  const navigate = useNavigate();
  const { hasNotifications } = useNotification();
  const [toggleProfile, setToggleProfile] = useState(false);
  const profileRef = useRef(null); // ref for the whole dropdown container
  const [userData, setUserData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ✅ Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setToggleProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load user data from localStorage
  useEffect(() => {
    const user = localStorage.getItem("adminUser");
    if (user) {
      setUserData(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Do you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("rememberedEmail");
      navigate("/");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formattedDate = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(currentTime);

  const formattedDay = new Intl.DateTimeFormat("en", {
    weekday: "long",
  }).format(currentTime);

  const formattedTime = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(currentTime);

  return (
    <div
      className={`flex-1 min-h-screen bg-white transition-all duration-300 ${
        sidebarExpanded || hoveringSidebar ? "ml-72" : "ml-16"
      }`}
    >
  
      <div
        className="h-16 fixed top-0 right-0 z-50 bg-[#fff] flex justify-between items-center border-b-2 border-b-[#E5E8F3] px-3"
        style={{
          left: sidebarExpanded || hoveringSidebar ? "18rem" : "4rem",
          transition: "left 0.3s ease",
        }}
      >
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-1 rounded-md cursor-pointer border border-gray-300"
          >
            <RiMenuFoldLine
              className={`h-5 w-5 transition-transform duration-300 ${
                !sidebarExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
          <div className="hidden md:block">
            <h4 className="text-lg font-semibold text-gray-900">
              {getGreeting()}, {userData?.name || "User"}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{formattedDay}</span>
              <span>•</span>
              <span>{formattedDate}</span>
              <span>•</span>
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/notifications")}
            className="relative border p-2 text-gray-500 text-xl border-gray-300 rounded cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <FaRegBell />
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
          <div className="relative" ref={profileRef}>
            <button
              className="cursor-pointer relative bg-[#CEA94C] rounded-full z-10 block"
              onClick={() => setToggleProfile((prev) => !prev)}
            >
              <img
                src={
                  "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80"
                }
                alt="logo"
                className="object-contain w-12 h-12 rounded-full"
              />
            </button>
            {toggleProfile && (
              <div className="absolute space-y-3 right-0 z-20 w-48 p-2 mt-2 bg-white rounded-lg shadow-xl border border-gray-300">
                <div className="flex gap-3 items-center">
                  <div className="bg-[#CEA94C] rounded-full">
                    <img
                      src={
                        "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80"
                      }
                      alt="logo"
                      className="object-contain w-12 h-12 rounded-full"
                    />
                  </div>
                  <div>
                    <h5 className="font-semibold">{userData?.name || "User"}</h5>
                    <p className="text-sm text-gray-500 capitalize">{userData?.role || "Admin"}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full border-t-2 border-gray-300 flex items-center justify-between cursor-pointer text-left px-4 py-2 text-sm text-red-500 font-semibold transition-colors duration-300 hover:bg-gray-100"
                >
                  Logout <CgLogOut />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="p-4 mt-16 overflow-auto">{children}</div>
    </div>
  );
};

export default MainContent;
