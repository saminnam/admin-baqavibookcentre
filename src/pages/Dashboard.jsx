import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";
import { 
  ShoppingCart, Package, Users, DollarSign, TrendingUp, 
  MessageSquare, Store, Calendar, ArrowUpRight, ArrowDownRight,
  RefreshCw, Loader2, Activity, CreditCard, UserCog, Globe, Bell, X
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { API_BASE_URL } from "../components/Api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { setHasNotifications } = useNotification();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalWebsiteUsers: 0,
    totalAdminUsers: 0,
    totalSellers: 0,
    totalRevenue: 0,
    pendingEnquiries: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueFilter, setRevenueFilter] = useState('monthly');
  const [revenueData, setRevenueData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch products
      const productsRes = await axios.get(`${API_BASE_URL}/products`);
      const products = productsRes.data?.products || [];
      
      // Fetch orders
      const ordersRes = await axios.get(`${API_BASE_URL}/orders`);
      const orders = ordersRes.data || [];
      
      // Fetch sellers
      const sellersRes = await axios.get(`${API_BASE_URL}/seller`);
      const sellers = sellersRes.data || [];
      
      // Fetch enquiries
      const enquiriesRes = await axios.get(`${API_BASE_URL}/contact/enquiries`);
      const enquiries = enquiriesRes.data || [];
      
      // Fetch website users
      const websiteUsersRes = await axios.get(`${API_BASE_URL}/auth/users`);
      const websiteUsers = websiteUsersRes.data || [];
      
      // Fetch admin users
      const adminUsersRes = await axios.get(`${API_BASE_URL}/admin-users`);
      const adminUsers = adminUsersRes.data || [];
      
      setStats({
        totalOrders: orders.length,
        totalProducts: products.length,
        totalWebsiteUsers: websiteUsers.length,
        totalAdminUsers: adminUsers.length,
        totalSellers: sellers.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        pendingEnquiries: enquiries.filter(e => !e.verified).length
      });
      
      setRecentOrders(orders.slice(0, 5));
      
      // Check for new orders and create notification
      if (orders.length > lastOrderCount && lastOrderCount > 0) {
        const newOrderCount = orders.length - lastOrderCount;
        const newNotification = {
          id: Date.now(),
          message: `${newOrderCount} new order${newOrderCount > 1 ? 's' : ''} received!`,
          timestamp: new Date(),
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 5));
        setHasNotifications(true);
      } else {
        setHasNotifications(false);
      }
      setLastOrderCount(orders.length);
      
      // Process revenue data based on filter
      processRevenueData(orders, revenueFilter);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [revenueFilter, lastOrderCount, setHasNotifications]);

  const processRevenueData = (orders, filter) => {
    const now = new Date();
    let labels = [];
    let data = [];
    
    if (filter === 'weekly') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        const dayRevenue = orders
          .filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.toDateString() === date.toDateString();
          })
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        data.push(dayRevenue);
      }
    } else if (filter === 'monthly') {
      // Last 30 days grouped by week
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      labels = weeks;
      for (let i = 0; i < 4; i++) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (28 - i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const weekRevenue = orders
          .filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= weekStart && orderDate < weekEnd;
          })
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        data.push(weekRevenue);
      }
    } else if (filter === 'yearly') {
      // Last 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        labels.push(months[date.getMonth()]);
        const monthRevenue = orders
          .filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
          })
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        data.push(monthRevenue);
      }
    }
    
    setRevenueData({ labels, data });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (recentOrders.length > 0) {
      processRevenueData(recentOrders, revenueFilter);
    }
  }, [revenueFilter, recentOrders]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trendValue}
          </div>
        )}
      </div>
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-3xl font-black text-slate-800">{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin text-[#E5B236]" size={48} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 flex items-center gap-3 animate-in slide-in-from-right duration-300 min-w-[300px]"
          >
            <div className="p-2 bg-[#E5B236]/10 rounded-full text-[#E5B236]">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">{notification.message}</p>
              <p className="text-xs text-slate-700">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={16} className="text-slate-700" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 mb-2">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={<ShoppingCart size={24} className="text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          trend="up"
          trendValue="12%"
        />
        <StatCard 
          title="Products" 
          value={stats.totalProducts} 
          icon={<Package size={24} className="text-white" />}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          trend="up"
          trendValue="8%"
        />
        <StatCard 
          title="Website Users" 
          value={stats.totalWebsiteUsers} 
          icon={<Globe size={24} className="text-white" />}
          color="bg-gradient-to-br from-cyan-500 to-cyan-600"
          trend="up"
          trendValue="5%"
        />
        <StatCard 
          title="Admin Users" 
          value={stats.totalAdminUsers} 
          icon={<UserCog size={24} className="text-white" />}
          color="bg-gradient-to-br from-indigo-500 to-indigo-600"
          trend="up"
          trendValue="2%"
        />
        <StatCard 
          title="Sellers" 
          value={stats.totalSellers} 
          icon={<Store size={24} className="text-white" />}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          trend="up"
          trendValue="3%"
        />
        <StatCard 
          title="Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          icon={<DollarSign size={24} className="text-white" />}
          color="bg-gradient-to-br from-[#E5B236] to-[#d4a32e]"
          trend="up"
          trendValue="15%"
        />
        <StatCard 
          title="Pending Enquiries" 
          value={stats.pendingEnquiries} 
          icon={<MessageSquare size={24} className="text-white" />}
          color="bg-gradient-to-br from-red-500 to-red-600"
          trend="down"
          trendValue="2%"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Analytics Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Revenue Analytics</h2>
            <div className="flex gap-2">
              {['weekly', 'monthly', 'yearly'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRevenueFilter(filter)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    revenueFilter === filter
                      ? 'bg-[#E5B236] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">
            {revenueData ? (
              <Line
                data={{
                  labels: revenueData.labels,
                  datasets: [
                    {
                      label: 'Revenue',
                      data: revenueData.data,
                      borderColor: '#E5B236',
                      backgroundColor: 'rgba(229, 178, 54, 0.1)',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: '#E5B236',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 4,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: '#1e293b',
                      titleColor: '#fff',
                      bodyColor: '#fff',
                      padding: 12,
                      displayColors: false,
                      callbacks: {
                        label: (context) => `$${context.raw.toLocaleString()}`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                      },
                      ticks: {
                        callback: (value) => `$${value.toLocaleString()}`,
                        color: '#64748b',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: '#64748b',
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-700">
                <Loader2 className="animate-spin" size={32} />
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
            <button 
              onClick={fetchDashboardData}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <RefreshCw size={18} className="text-slate-700" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentOrders.length > 0 ? recentOrders.slice(0, 5).map((order, index) => (
                  <tr key={order._id || index} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">#{order._id?.slice(-6) || `ORD${index + 1}`}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">${order.totalAmount || 0}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-600">
                        {order.status || 'Completed'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-slate-700">
                      No recent orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        {/* <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-[#E5B236] to-[#d4a32e] text-white rounded-xl font-bold hover:shadow-lg transition-all">
              <ShoppingCart size={20} />
              Add New Product
            </button>
            <button className="w-full flex items-center gap-3 p-4 bg-slate-50 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all">
              <Users size={20} />
              Manage Users
            </button>
            <button className="w-full flex items-center gap-3 p-4 bg-slate-50 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all">
              <Store size={20} />
              View Sellers
            </button>
            <button className="w-full flex items-center gap-3 p-4 bg-slate-50 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all">
              <MessageSquare size={20} />
              Check Enquiries
            </button>
          </div>
        </div> */}
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Activity size={32} />
            <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">Today</span>
          </div>
          <h3 className="text-3xl font-black mb-1">{stats.totalOrders}</h3>
          <p className="text-white/80 text-sm">New Orders Today</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} />
            <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">Today</span>
          </div>
          <h3 className="text-3xl font-black mb-1">${stats.totalRevenue.toLocaleString()}</h3>
          <p className="text-white/80 text-sm">Revenue Today</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users size={32} />
            <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">This Week</span>
          </div>
          <h3 className="text-3xl font-black mb-1">{stats.totalSellers}</h3>
          <p className="text-white/80 text-sm">Active Sellers</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
