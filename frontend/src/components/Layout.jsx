import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div class="min-h-screen flex flex-col bg-slate-50/30">
      <Navbar />
      <main class="flex-1 flex flex-col w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
