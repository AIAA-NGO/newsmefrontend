// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Signin from "./pages/auth/Signin";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from './routes/ProtectedRoute';
import Profile from './pages/account/Profile';
import CategoriesPage from './pages/Categories/CategoriesPage';
import BrandsPage from './pages/Brands/BrandsPage';
import UnitsPage from "./pages/Unit/UnitsPage";
import CreateProduct from './pages/products/CreateProduct';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import CustomersPage from './pages/Customers/CustomersPage';
import ProductPage from './pages/products/ProductPage';
import AdminDashboardControl from "./pages/dashboard/AdminDashboardControl";
import PosWithCart from "./pages/Pos/PosWithCart";
import NotFound from "./pages/NotFound";
import UsersList from './pages/Users/UsersList';
import CreateUser from './pages/Users/CreateUser';
import EditUser from './pages/Users/EditUser';
import UserChangePassword from './pages/Users/UserChangePassword';
import { AuthProvider } from './context/AuthContext';
import SalesList from "./pages/sales/SalesList";
import SalesHistory from "./pages/sales/SalesHistory";
import SalesReturnPage from './pages/sales/SalesReturnPage';
import CreatePurchase from './pages/Purchase/CreatePurchase';
import ReceivePurchases from './pages/Purchase/ReceivePurchases';
import PurchaseDetails from './pages/Purchase/PurchaseDetails';
import BusinessProfile from './pages/settings/business/BusinessProfile';

import Roles from './pages/settings/business/Roles';
import CreateRole from './pages/settings/business/CreateRole';
import RolesPermissions from './pages/settings/business/RolesPermissions';
import InventoryPage from './pages/inventory/InventoryPage';
import EditPurchase from './pages/Purchase/EditPurchase';
import ApplyDiscount from './pages/Discount/ApplyDiscount';
import SalesReport from './pages/reports/SalesReport';
import ProductPerformanceReport from './pages/reports/ProductPerformanceReport';
import InventoryValuationReport from './pages/reports/InventoryValuationReport';
import FinancialReports from './pages/reports/FinancialReports';
import SupplierPurchasesReport from './pages/reports/SupplierPurchasesReport';
import IncomeStatement from './pages/finance/IncomeStatement';
import CashFlow from './pages/finance/CashFlow';

function App() {
  return (
    <AuthProvider> 
      <Router>
        <div className="flex flex-col min-h-screen">
          <div className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/signin" element={<Signin />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
            
              
<Route element={<ProtectedRoute requiredPermissions={['dashboard_access']} />}>
  <Route path="/" element={<Navigate to="/dashboard" replace />} />
  <Route path="/dashboard" element={<DashboardLayout><AdminDashboardControl/></DashboardLayout>} />
</Route>

              {/* Products */}
              <Route element={<ProtectedRoute requiredPermissions={['product_view']} />}>
                <Route path="/products" element={<DashboardLayout><ProductPage /></DashboardLayout>} />
              </Route>
              
              <Route element={<ProtectedRoute requiredPermissions={['product_create']} />}>
                <Route path="/products/create" element={<DashboardLayout><CreateProduct /></DashboardLayout>} />
              </Route>

              {/* Categories */}
              <Route element={<ProtectedRoute requiredPermissions={['category_view']} />}>
                <Route path="/categories" element={<DashboardLayout><CategoriesPage /></DashboardLayout>} />
              </Route>

              {/* Brands */}
              <Route element={<ProtectedRoute requiredPermissions={['brand_view']} />}>
                <Route path="/brands" element={<DashboardLayout><BrandsPage /></DashboardLayout>} />
              </Route>

              {/* Units */}
              <Route element={<ProtectedRoute requiredPermissions={['unit_view']} />}>
                <Route path="/Unit" element={<DashboardLayout><UnitsPage /></DashboardLayout>} />
              </Route>

              {/* POS - Cashier access */}
              <Route element={<ProtectedRoute requiredPermissions={['pos_access']} />}>
                <Route path="/pos" element={<DashboardLayout><PosWithCart /></DashboardLayout>} />
              </Route>

              {/* Suppliers */}
              <Route element={<ProtectedRoute requiredPermissions={['supplier_view']} />}>
                <Route path="/suppliers/*" element={<DashboardLayout><SuppliersPage /></DashboardLayout>} />
              </Route>

              {/* Customers */}
              <Route element={<ProtectedRoute requiredPermissions={['customer_view']} />}>
                <Route path="/customers" element={<DashboardLayout><CustomersPage /></DashboardLayout>} />
              </Route>

              {/* Users - Admin only */}
              <Route element={<ProtectedRoute requiredPermissions={['user_view']} />}>
                <Route path="/users" element={<DashboardLayout><UsersList /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['user_create']} />}>
                <Route path="/Users/create" element={<DashboardLayout><CreateUser /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['user_update']} />}>
                <Route path="/Users/edit/:id" element={<DashboardLayout><EditUser /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['user_update']} />}>
                <Route path="/Users/change-password/:id" element={<DashboardLayout><UserChangePassword /></DashboardLayout>} />
              </Route>

              {/* Inventory */}
              <Route element={<ProtectedRoute requiredPermissions={['inventory_view']} />}>
                <Route path="/inventory" element={<DashboardLayout><InventoryPage /></DashboardLayout>} />
              </Route>

              {/* Purchases */}
              <Route element={<ProtectedRoute requiredPermissions={['purchase_view']} />}>
                <Route path="/purchases" element={<DashboardLayout><PurchaseDetails /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['purchase_create']} />}>
                <Route path="/purchases/create" element={<DashboardLayout><CreatePurchase /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['purchase_view']} />}>
                <Route path="/purchases/track" element={<DashboardLayout><ReceivePurchases /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['purchase_update']} />}>
                <Route path="/purchases/edit/:id" element={<DashboardLayout><EditPurchase /></DashboardLayout>} />
              </Route>

              {/* Sales */}
              <Route element={<ProtectedRoute requiredPermissions={['sale_view']} />}>
                <Route path="/sales" element={<DashboardLayout><SalesList /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['sale_view']} />}>
                <Route path="/sales/history" element={<DashboardLayout><SalesHistory /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['sale_return']} />}>
                <Route path="/sales/returns" element={<DashboardLayout><SalesReturnPage /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['sale_return']} />}>
                <Route path="/sales/returns/create" element={<DashboardLayout><SalesReturnPage /></DashboardLayout>} />
              </Route>

              {/* Discounts */}
              <Route element={<ProtectedRoute requiredPermissions={['discount_apply']} />}>
                <Route path="/apply-discount" element={<DashboardLayout><ApplyDiscount /></DashboardLayout>} />
              </Route>

              {/* Reports */}
              <Route element={<ProtectedRoute requiredPermissions={['salesreports_view']} />}>
                <Route path="/reports/sales" element={<DashboardLayout><SalesReport /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['productsreports_view']} />}>
                <Route path="/reports/products" element={<DashboardLayout><ProductPerformanceReport /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['inventoryreports_view']} />}>
                <Route path="/reports/inventory" element={<DashboardLayout><InventoryValuationReport /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['financialreports_view']} />}>
                <Route path="/reports/financial" element={<DashboardLayout><FinancialReports /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['suppliersreports_view']} />}>
                <Route path="/reports/suppliers" element={<DashboardLayout><SupplierPurchasesReport /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['finance_view']} />}>
                <Route path="/reports/income-statement" element={<DashboardLayout><IncomeStatement /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['finance_view']} />}>
                <Route path="/reports/cash-flow" element={<DashboardLayout><CashFlow /></DashboardLayout>} />
              </Route>

              {/* Settings - Admin only */}
              <Route element={<ProtectedRoute requiredPermissions={['settings_manage']} />}>
                <Route path="/settings/business/profile" element={<DashboardLayout><BusinessProfile /></DashboardLayout>} />
              </Route>

      

              <Route element={<ProtectedRoute requiredPermissions={['role_manage']} />}>
                <Route path="/settings/business/roles" element={<DashboardLayout><Roles /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['role_create']} />}>
                <Route path="/roles/create" element={<DashboardLayout><CreateRole /></DashboardLayout>} />
              </Route>

              <Route element={<ProtectedRoute requiredPermissions={['role_manage']} />}>
                <Route path="/settings/business/roles-permissions" element={<DashboardLayout><RolesPermissions /></DashboardLayout>} />
              </Route>

              {/* Profile - accessible to all authenticated users */}
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider> 
  );
}

export default App;