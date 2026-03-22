import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const items = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/properties', label: 'Properties' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/activity', label: 'Activity' },
  { to: '/admin/settings', label: 'Settings' }
];

export default function AdminLayout(){
  const navigate = useNavigate();
  const user = React.useMemo(()=>{
    try{ return JSON.parse(localStorage.getItem('user')||'null'); }catch(_e){return null}
  },[]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={()=>navigate('/admin/dashboard')} className="text-xl font-bold text-teal-700">Admin Dashboard</button>
            <div className="text-sm text-gray-600">Control Panel</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700">{user?.name || user?.email || 'Admin'}</div>
            <button onClick={()=>{ localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/signin'); }} className="px-3 py-1 bg-red-500 text-white rounded">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-6 gap-6">
        <aside className="md:col-span-1 bg-white rounded shadow p-4 h-full sticky top-20">
          <nav className="flex flex-col gap-1">
            {items.map(i=> (
              <NavLink key={i.to} to={i.to} className={({isActive}) => `block px-3 py-2 rounded hover:bg-teal-50 ${isActive? 'bg-teal-100 font-semibold text-teal-700' : 'text-gray-700'}`}>
                {i.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 border-t pt-4 text-xs text-gray-500">
            <div>Quick Actions</div>
            <div className="mt-2 flex flex-col gap-2">
              <button onClick={()=>navigate('/admin/properties')} className="text-sm px-3 py-2 bg-teal-600 text-white rounded">Add / Review Property</button>
              <button onClick={()=>navigate('/admin/users')} className="text-sm px-3 py-2 border rounded">Manage Users</button>
            </div>
          </div>
        </aside>

        <main className="md:col-span-5">
          <div className="bg-white rounded shadow p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
