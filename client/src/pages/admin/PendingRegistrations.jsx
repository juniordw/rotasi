import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';
import { assets } from '../../assets/assets';

const PendingRegistrations = () => {
  const { backendUrl, isAdmin, getToken } = useContext(AppContext)
  const [pendingRegistrations, setPendingRegistrations] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchPendingRegistrations = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get(
        `${backendUrl}/api/admin/pending-registrations`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setPendingRegistrations(data.pendingRegistrations)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleRegistration = async (registrationId, action) => {
    try {
      setLoading(true)
      const token = await getToken()
      
      const endpoint = action === 'approve' 
        ? '/api/admin/approve-registration'
        : '/api/admin/reject-registration'
      
      const { data } = await axios.post(
        `${backendUrl}${endpoint}`,
        { registrationId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        // Refresh the list after approval/rejection
        fetchPendingRegistrations()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchPendingRegistrations()
    }
  }, [isAdmin])

  return pendingRegistrations ? (
    <div className="min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <h2 className="text-2xl font-semibold mb-6">Pending Course Registrations</h2>
      
      {pendingRegistrations.length === 0 ? (
        <div className="w-full text-center py-10 bg-gray-50 rounded-md">
          <p className="text-gray-500">No pending registrations at the moment.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested On</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingRegistrations.map((registration) => (
                <tr key={registration._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full" 
                          src={registration.student.imageUrl || assets.profile_img} 
                          alt="" 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{registration.student.name}</div>
                        <div className="text-sm text-gray-500">{registration.student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-20">
                        <img 
                          className="h-16 w-20 object-cover rounded" 
                          src={registration.course.courseThumbnail} 
                          alt="" 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{registration.course.courseTitle}</div>
                        <div className="text-sm text-gray-500">By {registration.course.educator.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(registration.requestDate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleRegistration(registration._id, 'approve')}
                      disabled={loading}
                      className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md mr-2 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRegistration(registration._id, 'reject')}
                      disabled={loading}
                      className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  ) : <Loading />
};

export default PendingRegistrations;