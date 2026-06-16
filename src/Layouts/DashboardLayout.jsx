import React, { useState } from "react";

import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";
import MobileSiderBar from "../components/MobileSiderBar";
import { useLocation } from "react-router-dom";
import BreadCrumbs from "../components/BreadCrumbs";

const DashboardLayout = ({ children }) => {
  const location = useLocation();

  const pageName = (() => {
    const path = location.pathname;
    if (path === "/dashboard") return "dashboard";
    if (path === "/") return "login";

    const map = {
      "/add-user": "add-user",
      "/user-list": "user-list",
      "/add-blog": "add-blog",
      "/blog-list": "blog-list",
      "/add-contact": "add-contact",
      "/manage-enquires": "manage-enquires",
      "/manage-sellers": "manage-sellers",
      "/order-list": "order-list",
      "/add-product": "add-product",
      "/manage-hero-slides": "manage-hero-slides",
      "/manage-offer-hero-slides": "manage-offer-hero-slides",
      "/notifications": "notifications",
      "/add-category": "add-category",
      "/manage-categories": "manage-categories",
      "/manage-roles": "manage-roles",
      "/product-list": "product-list",
      "/website-users": "website-users",
    };

    return map[path] || path.replace(/\//g, "-").trim();
  })();

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [hoveringSidebar, setHoveringSidebar] = useState(false);


  return (
    <div className="flex h-screen w-full">
      <Sidebar
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        hoveringSidebar={hoveringSidebar}
        setHoveringSidebar={setHoveringSidebar}
      />
      {/* <MobileSiderBar /> */}
      <MainContent
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        hoveringSidebar={hoveringSidebar}
      >
        {location.pathname !== "/" && <BreadCrumbs pageName={pageName} />}
        {children}
      </MainContent>
    </div>
  );
};

export default DashboardLayout;
