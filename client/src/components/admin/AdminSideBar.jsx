import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';

const AdminSideBar = () => {

  const { isAdmin } = useContext(AppContext)

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: assets.home_icon },
    { name: 'Pending Registrations', path: '/admin/pending-registrations', icon: assets.appointments_icon },
    { name: 'Manage Users', path: '/admin/manage-users', icon: assets.person_tick_icon },
  ];

  return isAdmin && (
    <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-500 py-2 flex flex-col'>
      {menuItems.map((item) => (
        <NavLink
          to={item.path}
          key={item.name}
          end={item.path === '/admin'} // Add end prop for the Dashboard link
          className={({ isActive }) =>
            `flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 ${isActive
              ? 'bg-purple-50 border-r-[6px] border-purple-500/90'
              : 'hover:bg-gray-100/90 border-r-[6px] border-white hover:border-gray-100/90'
            }`
          }
        >
          <img src={item.icon} alt="" className="w-6 h-6" />
          <p className='md:block hidden text-center'>{item.name}</p>
        </NavLink>
      ))}
    </div>
  );
};

export default AdminSideBar;