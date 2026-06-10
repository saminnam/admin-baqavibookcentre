import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosLaptop } from "react-icons/io";
import { GoDot } from "react-icons/go";
import { MdKeyboardArrowRight } from "react-icons/md";
import {
  ShoppingCart,
  FileText,
  Store,
  Mail,
  Users,
  Layers,
  Globe,
  Tag,
} from "lucide-react";
import logo from "../assets/logos/logo-bg.png";

const navItems = [
  {
    icon: <IoIosLaptop className="text-2xl text-gray-600 dark:text-gray-400" />,
    label: "Dashboard",
    children: [],
    link: "/dashboard",
    permission: "dashboard",
  },
  {
    icon: <Layers className="text-2xl text-gray-600 dark:text-gray-400" />,
    label: "Hero Slides",
    children: [
      {
        label: "Manage Hero Slides",
        link: "/manage-hero-slides",
        permission: "manage-hero-slides",
      },
      {
        label: "Manage Offer Slides",
        link: "/manage-offer-hero-slides",
        permission: "manage-offer-hero-slides",
      },
    ],
    permission: "manage-hero-slides",
  },
  {
    icon: (
      <ShoppingCart className="text-2xl text-gray-600 dark:text-gray-400" />
    ),
    label: "Orders",
    children: [
      { label: "Manage Orders", link: "/order-list", permission: "order-list" },
    ],
    permission: "order-list",
  },
  {
    icon: <Layers className="text-2xl text-gray-600 dark:text-gray-400" />,
    label: "Products",
    children: [
      {
        label: "Add Products",
        link: "/add-product",
        permission: "add-product",
      },
      {
        label: "Manage Products",
        link: "/product-list",
        permission: "product-list",
      },
    ],
    permission: "product-list",
  },
  {
    icon: <Tag className="text-2xl text-gray-600 dark:text-gray-400" />,
    label: "Category",
    children: [
      { label: "Add Category", link: "/add-category" },
      { label: "Manage Category", link: "/manage-categories" },
    ],
    permission: "manage-categories",
  },
  {
    icon: <FileText className="text-2xl text-gray-600 dark:text-gray-400" />,
    label: "Blogs",
    children: [
      { label: "Add Blogs", link: "/add-blog", permission: "add-blog" },
      { label: "Manage Blogs", link: "/blog-list", permission: "blog-list" },
    ],
    permission: "blog-list",
  },
  {
    icon: <Store className="text-2xl text-gray-600 dark:text-gray-400" />,
    label: "Sellers",
    children: [
      {
        label: "Manage Sellers",
        link: "/manage-sellers",
        permission: "manage-sellers",
      },
    ],
    permission: "manage-sellers",
  },
  {
    icon: <Mail className="text-2xl text-gray-600 dark:text-gray-400" />,
    label: "Contacts",
    children: [
      { label: "Add Contact", link: "/add-contact" },
      {
        label: "Manage Enquires",
        link: "/manage-enquires",
        permission: "manage-enquires",
      },
    ],
    permission: "manage-enquires",
  },
  {
    icon: <Users className="text-2xl text-gray-600 dark:text-gray-400" />,
    label: "System Users",
    children: [
      { label: "Add Users", link: "/add-user", permission: "add-user" },
      { label: "Manage Users", link: "/user-list", permission: "user-list" },
    ],
    permission: "user-list",
  },
  {
    icon: <Users className="text-2xl text-gray-600 dark:text-gray-400" />,
    label: "Roles & Permission",
    children: [
      {
        label: "Manage Roles",
        link: "/manage-roles",
        permission: "manage-roles",
      },
    ],
    permission: "manage-roles",
  },
  {
    icon: <Globe className="text-2xl text-gray-600 dark:text-gray-400" />,
    label: "Website Users",
    children: [],
    link: "/website-users",
    permission: "website-users",
  },
];

const Sidebar = ({ sidebarExpanded, hoveringSidebar, setHoveringSidebar }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    const loadPermissions = () => {
      const user = localStorage.getItem("adminUser");
      if (user) {
        const userData = JSON.parse(user);
        console.log(
          "Loading permissions from localStorage:",
          userData.permissions,
        );
        setUserPermissions(userData.permissions || []);
      }
    };

    loadPermissions();

    const handleStorageChange = () => {
      loadPermissions();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("custom-storage-update", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("custom-storage-update", handleStorageChange);
    };
  }, []);

  const handleDropdownToggle = (label) => {
    if (sidebarExpanded || hoveringSidebar) {
      setOpenDropdown(openDropdown === label ? null : label);
    }
  };

  const hasPermission = (permission) => {
    if (!permission) return true;
    // If permissions is undefined/null (old users), show all
    if (userPermissions === undefined || userPermissions === null) return true;
    // If permissions is empty array, show all (treat as full access)
    if (userPermissions.length === 0) return true;
    // If permissions has items, check if user has the specific permission
    return userPermissions.includes(permission);
  };

  const filteredNavItems = navItems
    .filter((item) => hasPermission(item.permission))
    .map((item) => ({
      ...item,
      children: item.children.filter((child) =>
        hasPermission(child.permission),
      ),
    }))
    .filter(
      (item) =>
        item.children.length > 0 ||
        !item.permission ||
        hasPermission(item.permission),
    );

  console.log("User permissions:", userPermissions);
  console.log("Filtered nav items:", filteredNavItems);

  return (
    <div className="flex">
      <aside
        id="sidebar"
        className={`${
          sidebarExpanded || hoveringSidebar ? "w-72" : "w-16"
        } fixed top-0 left-0 h-screen z-40 transition-all duration-300 bg-white shadow border-r-2 border-[#F8F9FB] dark:bg-gray-800 dark:border-gray-700`}
        onMouseEnter={() => !sidebarExpanded && setHoveringSidebar(true)}
        onMouseLeave={() => setHoveringSidebar(false)}
      >
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo-Gold" className="w-12" />
            {(sidebarExpanded || hoveringSidebar) && (
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                ADMIN PANEL
              </span>
            )}
          </div>
        </div>
        <nav className="mt-5 px-2 text-[14px]">
          <ul className="flex flex-col gap-2 max-w-[280px] mx-auto">
            {filteredNavItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.link}
                  className="flex items-center justify-between gap-2 rounded transition-all duration-300 hover:bg-amber-100 dark:hover:bg-white p-2 font-medium hover:cursor-pointer dark:hover:text-gray-800 text-gray-700 dark:text-gray-200"
                  onClick={() => handleDropdownToggle(item.label)}
                >
                  <span className="flex gap-3 items-center">
                    {item.icon}
                    {(sidebarExpanded || hoveringSidebar) && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </span>
                  {item.children.length > 0 &&
                    (sidebarExpanded || hoveringSidebar) && (
                      <MdKeyboardArrowRight
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
                          openDropdown === item.label ? "rotate-90" : ""
                        }`}
                      />
                    )}
                </Link>
                <ul
                  className={`flex flex-col pl-6 pr-2 my-1 overflow-hidden transition-all duration-300 ease-in-out
                    ${
                      openDropdown === item.label &&
                      (sidebarExpanded || hoveringSidebar)
                        ? "max-h-screen opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                >
                  {item.children.map((child) => (
                    <li
                      key={child.label}
                      className="flex font-semibold items-center p-2 gap-2 rounded transition-all duration-300 hover:bg-amber-100 dark:hover:bg-white text-gray-700 dark:hover:text-gray-800 dark:text-gray-200"
                    >
                      <GoDot className="text-sm text-gray-500 dark:text-gray-400" />
                      <Link
                        to={child.link}
                        className="whitespace-nowrap w-full"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
