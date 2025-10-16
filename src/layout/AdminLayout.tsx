// import React from 'react'; // unused
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className='h-screen bg-black text-white flex flex-col overflow-hidden'>
      {/* Full screen admin content */}
      <div className='flex-1 flex flex-col h-full'>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
