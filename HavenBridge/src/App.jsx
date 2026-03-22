import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import HomePage from "./pages/HomePage";
import SellProperty from "./pages/SellProperty";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetail from "./pages/PropertyDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import CheckEmail from "./pages/CheckEmail";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import BookingPage from "./pages/BookingPage";
import MyBookings from "./pages/MyBookings";
import MyReservations from "./pages/MyReservations";
import MyFavorites from "./pages/MyFavorites";
import SavedSearches from "./pages/SavedSearches";
import Messages from "./pages/Messages";
import Leases from "./pages/Leases";
import BookingPayment from "./pages/BookingPayment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import MyListings from "./pages/MyListings";
import Notifications from "./pages/Notifications";
import SellerBookings from "./pages/SellerBookings";
import SellerStripe from "./pages/SellerStripe";
import SellerStripeReturn from "./pages/SellerStripeReturn";
import SellerStripeRefresh from "./pages/SellerStripeRefresh";
import PropertyMarketTrends from "./pages/PropertyMarketTrends";
import FirstTimeBuyersGuide from "./pages/FirstTimeBuyersGuide";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminLayout from "./components/admin/AdminLayout";
import AdminReports from "./pages/admin/Reports";
import AdminActivity from "./pages/admin/Activity";
import AdminSettings from "./pages/admin/Settings";
import { FavoritesProvider } from "./contexts/FavoritesContext";

function App() {
  return (
    <FavoritesProvider>
      <Routes>
        {/* Layout wrapper */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sell" element={<SellProperty />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/book/:propertyId" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-reservations" element={<MyReservations />} />
          <Route path="/my-favorites" element={<MyFavorites />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/saved-searches" element={<SavedSearches />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/leases" element={<Leases />} />
          <Route path="/seller/bookings" element={<SellerBookings />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/booking/:bookingId/pay" element={<BookingPayment />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/seller/stripe" element={<SellerStripe />} />
          <Route path="/seller/stripe/return" element={<SellerStripeReturn />} />
          <Route path="/seller/stripe/refresh" element={<SellerStripeRefresh />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/news/property-market-trends" element={<PropertyMarketTrends />} />
          <Route path="/news/first-time-buyers-guide" element={<FirstTimeBuyersGuide />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="properties" element={<AdminProperties />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="activity" element={<AdminActivity />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </FavoritesProvider>
  );
}

export default App;
