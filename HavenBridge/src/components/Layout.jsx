import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
