import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import PublicRoute from "./utils/PublicRoute";
import ProtectedRoute from "./utils/ProtectedRoute";
import DashboardLayout from "./Layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import ManageUsers from "./pages/admin-users/ManageUsers";
import AddUser from "./pages/admin-users/AddUser";
import AddBlog from "./pages/blogs/AddBlog";
import ManageBlogs from "./pages/blogs/ManageBlogs";
import ManageEnquiry from "./pages/enquiry/ManageEnquiry";
import ManageOrders from "./pages/orders/ManageOrders";
import ManageSellers from "./pages/seller-details/ManageSeller";
import AddProduct from "./pages/products/AddProduct";
import ManageProducts from "./pages/products/ManageProducts";
import ToastNotification from "../../frontend/src/modals/ToastNotification";
import AddContact from "./pages/enquiry/AddContact";
import ManageWebsiteUsers from "./pages/website-users/ManageWebsiteUsers";
import { NotificationProvider } from "./context/NotificationContext";

const App = () => {
  return (
    <NotificationProvider>
      <Routes>
        {/* Login Page - Default Route */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        
        {/* Dashboard Routes - Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-user"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AddUser />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-list"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ManageUsers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-blog"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AddBlog />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/blog-list"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ManageBlogs />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-contact"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                {" "}
                <AddContact />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-enquires"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ManageEnquiry />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-sellers"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ManageSellers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-list"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ManageOrders />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AddProduct />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/product-list"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ManageProducts />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/website-users"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ManageWebsiteUsers />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastNotification />
    </NotificationProvider>
  );
};

export default App;
