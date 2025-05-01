import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSideBar from '../../components/admin/AdminSideBar'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminFooter from '../../components/admin/AdminFooter'

const Admin = () => {
    return (
        <div className="text-default min-h-screen bg-white">
            <AdminNavbar />
            <div className='flex'>
                <AdminSideBar />
                <div className='flex-1'>
                    {<Outlet />}
                </div>
            </div>
            <AdminFooter />
        </div>
    )
}

export default Admin;