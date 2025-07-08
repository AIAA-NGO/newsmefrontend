// src/components/Sidebar.js
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Home, Boxes, Users, ShoppingCart, FileBarChart2, 
  ChevronDown, ClipboardList, DollarSign, FileText,
  Settings, CreditCard, ChevronLeft, ChevronRight,
   Landmark
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Sidebar({ isMobileOpen, isMinimized, onLinkClick, onToggleMinimize }) {
  const location = useLocation();
  const { hasPermission, user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Dropdown states
  const [productsOpen, setProductsOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [purchasesOpen, setPurchasesOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    if (isMinimized || !isMobileOpen) {
      setProductsOpen(false);
      setReportsOpen(false);
      setSalesOpen(false);
      setSettingsOpen(false);
      setPurchasesOpen(false);
      setFinanceOpen(false);
    }
  }, [isMinimized, isMobileOpen]);

  // Helper function to render menu items with permission checks
  const renderMenuItem = (item) => {
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
      return null;
    }
    return (
      <Link 
        key={item.path}
        to={item.path} 
        onClick={() => {
          onLinkClick();
          item.onClick?.();
        }}
        className={`flex items-center gap-2 py-3 px-3 rounded-md text-sm transition-colors
          ${location.pathname === item.path ? 'text-blue-400 font-medium bg-blue-900/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'}`}
      >
        {item.icon}
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {isMobileOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onLinkClick}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-50
        bg-gradient-to-b from-gray-800 to-gray-900 text-gray-100 shadow-xl
        overflow-y-auto transition-all duration-300 ease-in-out
        ${isMobile ? (isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full') : 'translate-x-0'}
        ${isMinimized ? 'md:w-20' : 'md:w-64'}
      `}>
        {/* Logo & Collapse Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {(!isMinimized || isMobile) && (
              <span className="text-xl font-bold select-none bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                InventoryPro
              </span>
            )}
          </div>
          <button
            onClick={onToggleMinimize}
            className="hidden md:inline-flex p-1.5 rounded-lg hover:bg-gray-700 transition-all"
            aria-label={isMinimized ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isMinimized ? (
              <ChevronRight size={20} className="text-gray-300" />
            ) : (
              <ChevronLeft size={20} className="text-gray-300" />
            )}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 p-2 mt-2 select-none">
          {/* Home - Only for users with dashboard_access permission */}
{hasPermission('dashboard_access') && (
  <Link
    to="/"
    onClick={onLinkClick}
    className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-all
      ${isActive('/') ? 'bg-blue-900/30 text-white border-l-4 border-blue-500' : 'hover:bg-gray-700/50'}
      ${isMinimized && !isMobile ? 'justify-center px-2' : ''}`}
    title={isMinimized && !isMobile ? 'Home' : undefined}
  >
    <Home size={20} className={`${isActive('/') ? 'text-blue-400' : 'text-gray-300'}`} />
    {(!isMinimized || isMobile) && <span className="font-medium">Home</span>}
  </Link>
)}

          {/* Manage Product - Only for users with product_view permission */}
          {hasPermission('product_view') && (
            <div className="relative">
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                className={`flex items-center justify-between w-full px-4 py-4 rounded-lg transition-all
                  ${isActive('/products') ? 'bg-blue-900/30 text-white border-l-4 border-blue-500' : 'hover:bg-gray-700/50'}
                  ${isMinimized && !isMobile ? 'justify-center px-2' : ''}`}
                title={isMinimized && !isMobile ? 'Manage Product' : undefined}
              >
                <div className="flex items-center gap-3">
                  <Boxes size={20} className={`${isActive('/products') ? 'text-blue-400' : 'text-gray-300'}`} />
                  {(!isMinimized || isMobile) && <span className="font-medium">Manage Product</span>}
                </div>
                {(!isMinimized || isMobile) && (
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform ${productsOpen ? 'rotate-180' : ''} text-gray-400`}
                  />
                )}
              </button>
              {(productsOpen && (!isMinimized || isMobile)) && (
                <div className="ml-10 mt-2 flex flex-col gap-1 pl-2 border-l border-gray-700">
                  {[
                    { path: '/products', label: 'Product List', requiredPermission: 'product_view' },
                    { path: '/products/create', label: 'Create Product', requiredPermission: 'product_create' },
                    { path: '/categories', label: 'Categories', requiredPermission: 'category_view' },
                    { path: '/brands', label: 'Brands', requiredPermission: 'brand_view' },
                    { path: '/Unit', label: 'Units', requiredPermission: 'unit_view' }
                  ].map(item => ({
                    ...item,
                    icon: <Boxes size={14} />,
                    onClick: () => setProductsOpen(false)
                  })).map(renderMenuItem)}
                </div>
              )}
            </div>
          )}

          {/* POS - Only for users with pos_access permission */}
          {hasPermission('pos_access') && (
            <Link
              to="/pos"
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-all
                ${isActive('/pos') ? 'bg-blue-900/30 text-white border-l-4 border-blue-500' : 'hover:bg-gray-700/50'}
                ${isMinimized && !isMobile ? 'justify-center px-2' : ''}`}
              title={isMinimized && !isMobile ? 'POS' : undefined}
            >
              <CreditCard size={20} className={`${isActive('/pos') ? 'text-blue-400' : 'text-gray-300'}`} />
              {(!isMinimized || isMobile) && <span className="font-medium">POS</span>}
            </Link>
          )}

          {/* Purchases - Only for users with purchase_view permission */}
          {hasPermission('purchase_view') && (
            <div className="relative">
              <button
                onClick={() => setPurchasesOpen(!purchasesOpen)}
                className={`flex items-center justify-between w-full px-4 py-4 rounded-lg transition-all
                  ${isActive('/purchases') ? 'bg-blue-900/30 text-white border-l-4 border-blue-500' : 'hover:bg-gray-700/50'}
                  ${isMinimized && !isMobile ? 'justify-center px-2' : ''}`}
                title={isMinimized && !isMobile ? 'Purchases' : undefined}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart size={20} className={`${isActive('/purchases') ? 'text-blue-400' : 'text-gray-300'}`} />
                  {(!isMinimized || isMobile) && <span className="font-medium">Purchases</span>}
                </div>
                {(!isMinimized || isMobile) && (
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform ${purchasesOpen ? 'rotate-180' : ''} text-gray-400`}
                  />
                )}
              </button>
              {(purchasesOpen && (!isMinimized || isMobile)) && (
                <div className="ml-10 mt-2 flex flex-col gap-1 pl-2 border-l border-gray-700">
                  {[
                    { path: '/purchases/create', label: 'Create Purchase', requiredPermission: 'purchase_create' },
                    { path: '/purchases', label: 'Purchase List', requiredPermission: 'purchase_view' },
                    { path: '/purchases/track', label: 'Receive Purchases', requiredPermission: 'purchase_view' }
                  ].map(item => ({
                    ...item,
                    icon: <ShoppingCart size={14} />,
                    onClick: () => setPurchasesOpen(false)
                  })).map(renderMenuItem)}
                </div>
              )}
            </div>
          )}

          {/* Customers - Only for users with customer_view permission */}
          {hasPermission('customer_view') && (
            <Link
              to="/customers"
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-all
                ${isActive('/customers') ? 'bg-blue-900/30 text-white border-l-4 border-blue-500' : 'hover:bg-gray-700/50'}
                ${isMinimized && !isMobile ? 'justify-center px-2' : ''}`}
              title={isMinimized && !isMobile ? 'Customers' : undefined}
            >
              <Users size={20} className={`${isActive('/customers') ? 'text-blue-400' : 'text-gray-300'}`} />
              {(!isMinimized || isMobile) && <span className="font-medium">Customers</span>}
            </Link>
          )}

          {/* Suppliers - Only for users with supplier_view permission */}
          {hasPermission('supplier_view') && (
            <Link
              to="/suppliers"
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-all
                ${isActive('/suppliers') ? 'bg-blue-900/30 text-white border-l-4 border-blue-500' : 'hover:bg-gray-700/50'}
                ${isMinimized && !isMobile ? 'justify-center px-2' : ''}`}
              title={isMinimized && !isMobile ? 'Suppliers' : undefined}
            >
              <Users size={20} className={`${isActive('/suppliers') ? 'text-blue-400' : 'text-gray-300'}`} />
              {(!isMinimized || isMobile) && <span className="font-medium">Suppliers</span>}
            </Link>
          )}

          {/* Inventory - Only for users with inventory_view permission */}
          {hasPermission('inventory_view') && (
            <Link
              to="/inventory"
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-all
                ${isActive('/inventory') ? 'bg-blue-900/30 text-white border-l-4 border-blue-500' : 'hover:bg-gray-700/50'}
                ${isMinimized && !isMobile ? 'justify-center px-2' : ''}`}
              title={isMinimized && !isMobile ? 'Inventory' : undefined}
            >
              <FileText size={20} className={`${isActive('/inventory') ? 'text-blue-400' : 'text-gray-300'}`} />
              {(!isMinimized || isMobile) && <span className="font-medium">Inventory</span>}
            </Link>
          )}

          {/* Apply Discount - Only for users with discount_apply permission */}
          {hasPermission('discount_apply') && (
            <Link
              to="/apply-discount"
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-all
                ${isActive('/apply-discount') ? 'bg-blue-900/30 text-white border-l-4 border-blue-500' : 'hover:bg-gray-700/50'}
                ${isMinimized && !isMobile ? 'justify-center px-2' : ''}`}
              title={isMinimized && !isMobile ? 'Apply Discount' : undefined}
            >
              <DollarSign size={20} className={`${isActive('/apply-discount') ? 'text-blue-400' : 'text-gray-300'}`} />
              {(!isMinimized || isMobile) && <span className="font-medium">Apply Discount</span>}
            </Link>
          )}

          {/* Finance Module - Only for users with reports_view permission */}
          {hasPermission('finance_view') && (
            <div className="relative">
              <button
                onClick={() => setFinanceOpen(!financeOpen)}
                className={`flex items-center justify-between w-full px-4 py-4 rounded-lg transition-all
                  ${isActive('/reports/income-statement') ? 'bg-blue-900/30 text-white border-l-4 border-blue-500' : 'hover:bg-gray-700/50'}
                  ${isMinimized && !isMobile ? 'justify-center px-2' : ''}`}
                title={isMinimized && !isMobile ? 'Finance' : undefined}
              >
                <div className="flex items-center gap-3">
                  <Landmark size={20} className={`${isActive('/reports/income-statement') ? 'text-blue-400' : 'text-gray-300'}`} />
                  {(!isMinimized || isMobile) && <span className="font-medium">Finance</span>}
                </div>
                {(!isMinimized || isMobile) && (
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform ${financeOpen ? 'rotate-180' : ''} text-gray-400`}
                  />
                )}
              </button>
              {(financeOpen && (!isMinimized || isMobile)) && (
                <div className="ml-10 mt-2 flex flex-col gap-1 pl-2 border-l border-gray-700">
                  {[
                    { path: '/reports/income-statement', label: 'Income Statement' },
                    { path: '/reports/cash-flow', label: 'Cash Flow Statement' }
                  ].map(item => ({
                    ...item,
                    icon: <FileText size={14} />,
                    requiredPermission: 'finance_view',
                    onClick: () => setFinanceOpen(false)
                  })).map(renderMenuItem)}
                </div>
              )}
            </div>
          )}

          {/* Users - Only for users with user_view permission */}
          {hasPermission('user_view') && (
            <Link
              to="/users"
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-all
                ${isActive('/users') ? 'bg-blue-900/30 text-white border-l-4 border-blue-500' : 'hover:bg-gray-700/50'}
                ${isMinimized && !isMobile ? 'justify-center px-2' : ''}`}
              title={isMinimized && !isMobile ? 'Users' : undefined}
            >
              <Users size={20} className={`${isActive('/users') ? 'text-blue-400' : 'text-gray-300'}`} />
              {(!isMinimized || isMobile) && <span className="font-medium">Users</span>}
            </Link>
          )}

          {/* Sales - Only for users with sale_view permission */}
          {hasPermission('sale_view') && (
            <div className="relative">
              <button
                onClick={() => setSalesOpen(!salesOpen)}
                className={`flex items-center justify-between w-full px-4 py-4 rounded-lg transition-all
                  ${isActive('/sales') ? 'bg-blue-900/30 text-white border-l-4 border-blue-500' : 'hover:bg-gray-700/50'}
                  ${isMinimized && !isMobile ? 'justify-center px-2' : ''}`}
                title={isMinimized && !isMobile ? 'Sales' : undefined}
              >
                <div className="flex items-center gap-3">
                  <ClipboardList size={20} className={`${isActive('/sales') ? 'text-blue-400' : 'text-gray-300'}`} />
                  {(!isMinimized || isMobile) && <span className="font-medium">Sales</span>}
                </div>
                {(!isMinimized || isMobile) && (
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform ${salesOpen ? 'rotate-180' : ''} text-gray-400`}
                  />
                )}
              </button>
              {(salesOpen && (!isMinimized || isMobile)) && (
                <div className="ml-10 mt-2 flex flex-col gap-1 pl-2 border-l border-gray-700">
                  {[
                    { path: '/sales', label: 'Sales List', requiredPermission: 'sale_view' },
                    { path: '/sales/returns', label: 'Sales Returns', requiredPermission: 'sale_return' }
                  ].map(item => ({
                    ...item,
                    icon: <ClipboardList size={14} />,
                    onClick: () => setSalesOpen(false)
                  })).map(renderMenuItem)}
                </div>
              )}
            </div>
          )}

          {/* Reports - Only for users with specific report permissions */}
{(hasPermission('salesreports_view') || 
  hasPermission('productsreports_view') || 
  hasPermission('inventoryreports_view') || 
  hasPermission('financialreports_view') || 
  hasPermission('suppliersreports_view')) && (
  <div className="relative">
    <button
      onClick={() => setReportsOpen(!reportsOpen)}
      className={`flex items-center justify-between w-full px-4 py-4 rounded-lg transition-all
        ${isActive('/reports') ? 'bg-blue-900/30 text-white border-l-4 border-blue-500' : 'hover:bg-gray-700/50'}
        ${isMinimized && !isMobile ? 'justify-center px-2' : ''}`}
      title={isMinimized && !isMobile ? 'Reports' : undefined}
    >
      <div className="flex items-center gap-3">
        <FileBarChart2 size={20} className={`${isActive('/reports') ? 'text-blue-400' : 'text-gray-300'}`} />
        {(!isMinimized || isMobile) && <span className="font-medium">Reports</span>}
      </div>
      {(!isMinimized || isMobile) && (
        <ChevronDown 
          size={16} 
          className={`transition-transform ${reportsOpen ? 'rotate-180' : ''} text-gray-400`}
        />
      )}
    </button>
    {(reportsOpen && (!isMinimized || isMobile)) && (
      <div className="ml-10 mt-2 flex flex-col gap-1 pl-2 border-l border-gray-700">
        {[
          { path: '/reports/sales', label: 'Sales Report', requiredPermission: 'salesreports_view' },
          { path: '/reports/products', label: 'Product Performance', requiredPermission: 'productsreports_view' },
          { path: '/reports/inventory', label: 'Inventory Valuation', requiredPermission: 'inventoryreports_view' },
          { path: '/reports/financial', label: 'Financial Reports', requiredPermission: 'financialreports_view' },
          { path: '/reports/suppliers', label: 'Supplier Purchases', requiredPermission: 'suppliersreports_view' }
        ].map(item => ({
          ...item,
          icon: <FileBarChart2 size={14} />,
          onClick: () => setReportsOpen(false)
        })).map(renderMenuItem)}
      </div>
    )}
  </div>
)}
          {/* Settings - Only for users with settings_manage permission */}
          {hasPermission('settings_manage') && (
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`flex items-center justify-between w-full px-4 py-4 rounded-lg transition-all
                  ${isActive('/settings/business') ? 'bg-blue-900/30 text-white border-l-4 border-blue-500' : 'hover:bg-gray-700/50'}
                  ${isMinimized && !isMobile ? 'justify-center px-2' : ''}`}
                title={isMinimized && !isMobile ? 'Settings' : undefined}
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} className={`${isActive('/settings/business') ? 'text-blue-400' : 'text-gray-300'}`} />
                  {(!isMinimized || isMobile) && <span className="font-medium">Settings</span>}
                </div>
                {(!isMinimized || isMobile) && (
                  <ChevronDown 
                    size={16} 
                    className={`transition-transform ${settingsOpen ? 'rotate-180' : ''} text-gray-400`}
                  />
                )}
              </button>
              {(settingsOpen && (!isMinimized || isMobile)) && (
                <div className="ml-10 mt-2 flex flex-col gap-1 pl-2 border-l border-gray-700">
                  {[
                    { path: '/settings/business/profile', label: 'Business Profile' },
   
                    { path: '/settings/business/roles', label: 'Roles', requiredPermission: 'role_manage' },
                    { path: '/settings/business/roles-permissions', label: 'Roles & Permissions', requiredPermission: 'role_manage' }
                  ].map(item => ({
                    ...item,
                    icon: <Settings size={14} />,
                    requiredPermission: item.requiredPermission || 'settings_manage',
                    onClick: () => setSettingsOpen(false)
                  })).map(renderMenuItem)}
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}