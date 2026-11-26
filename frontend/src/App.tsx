import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RootLayout } from "@/components/layout/RootLayout";
import { FloatingWhatsAppButton } from "@/components/whatsapp/FloatingWhatsAppButton";
import HomePage from "@/pages/HomePage";

const VehiclesPage = lazy(() => import("@/pages/VehiclesPage"));
const VehicleDetailPage = lazy(() => import("@/pages/VehicleDetailPage"));
const BookingPage = lazy(() => import("@/pages/BookingPage"));
const ReviewPage = lazy(() => import("@/pages/ReviewPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const PoliciesPage = lazy(() => import("@/pages/PoliciesPage"));
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminBookings = lazy(() => import("@/pages/admin/AdminBookings"));
const AdminVehicles = lazy(() => import("@/pages/admin/AdminVehicles"));
const AdminCalendar = lazy(() => import("@/pages/admin/AdminCalendar"));
const AdminReviews = lazy(() => import("@/pages/admin/AdminReviews"));
const AdminPricing = lazy(() => import("@/pages/admin/AdminPricing"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

export function App() {
  return (
    <BrowserRouter>
      <FloatingWhatsAppButton />
      <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
        <Routes>
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="vehicles" element={<AdminVehicles />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="pricing" element={<AdminPricing />} />
          </Route>
          <Route element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="bikes" element={<VehiclesPage category="motorcycle" />} />
            <Route path="scooty" element={<VehiclesPage category="scooty" />} />
            <Route path="cars" element={<VehiclesPage category="car" />} />
            <Route path="jeeps" element={<VehiclesPage category="jeep" />} />
            <Route path="vehicles/:slug" element={<VehicleDetailPage />} />
            <Route path="destinations/*" element={<Navigate to="/bikes" replace />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="review" element={<ReviewPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="policies" element={<PoliciesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
