import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import ProcurementDetailsForm from './components/ProcurementDetailsForm';
import VendorDetailsForm from './components/VendorDetailsForm';
import VendorDashboard from './pages/vendors/VendorDashboard';
import ProcurementDashboard from './pages/procurement/ProcurementDashboard';
import ProcurementInventory from './pages/procurement/ProcurementInventory';
import ProcurementOrders from './pages/procurement/ProcurementOrders';
import VendorProducts from './pages/vendors/VendorProducts';
import VendorOrders from './pages/vendors/VendorOrders';
import ProcurementVendorsList from './pages/procurement/ProcurementVendorsList';
import PlaceOrder from './pages/procurement/PlaceOrder'; 
import ProcurementPayment from './pages/procurement/ProcurementPayment';  
import ProcurementAccount from './pages/procurement/ProcurementAccount';
import VendorPayment from './pages/vendors/VendorPayment';
import VendorAccount from './pages/vendors/vendoraccount';
import VendorSettings from './pages/vendors/vendorsettings';
import VenDeviceTrack from './pages/vendors/VenDeviceTrack';
import ProDeviceTrack from './pages/procurement/ProDeviceTrack';
import ProcurementReport from './pages/procurement/Procurementreport';
import VendorReport from './pages/vendors/Vendorreport';
import ProcurementSettings from './pages/procurement/ProcurementSettings';
import QAReport from "./pages/qareport/QAReport";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Dashboard />} />

        {/* Authentication Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/procurementdetailsform" element={<ProcurementDetailsForm />} />
        <Route path="/vendordetailsform" element={<VendorDetailsForm />} />

        {/* Dashboards */}
        <Route path="/procurementdashboard" element={<ProcurementDashboard />} />
        <Route path="/vendordashboard" element={<VendorDashboard />} />

        {/* Procurement Panel */}
        <Route path="/procurementinventory" element={<ProcurementInventory />} />
        <Route path="/procurementorders" element={<ProcurementOrders />} /> {/* ✅ Fixed case */}
        <Route path="/procurementvendorslist" element={<ProcurementVendorsList />} />

        {/* Vendor Panel */}
        <Route path="/vendorproducts" element={<VendorProducts />} />
        <Route path="/vendororders" element={<VendorOrders />} />

        {/* ✅ Common Order Placement Page */}
        <Route path="/placeorder" element={<PlaceOrder />} />

        {/* Payment Page */}
        <Route path="/procurementpayment" element={<ProcurementPayment />} />

  {/* Account Page */}
  <Route path="/procurementaccount" element={<ProcurementAccount />} /> 

  {/* Procurement Settings Page */}
  <Route path="/procurementsettings" element={<ProcurementSettings />} />

  {/* Vendor Account Page */}
  <Route path="/vendoraccount" element={<VendorAccount />} />

  {/* Vendor Settings Page */}
  <Route path="/vendorsettings" element={<VendorSettings />} />

  {/* Vendor Payment Page */}
  <Route path="/vendorpayment" element={<VendorPayment />} />
  <Route path="/vendevicetrack" element={<VenDeviceTrack />} />
  <Route path="/prodevicetrack" element={<ProDeviceTrack />} />
  <Route path="/procurementreport" element={<ProcurementReport />} />
  <Route path="/vendorreport" element={<VendorReport />} />
  <Route path="/qa-report/:id" element={<QAReport />} />

      </Routes>
    </Router>
  );
}
