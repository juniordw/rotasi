import React from 'react';

const EnrollmentStatus = ({ status }) => {
  // Define appearance based on status
  const statusStyles = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Pending Approval'
    },
    approved: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Approved'
    },
    rejected: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Rejected'
    },
    completed: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      label: 'Completed'
    },
    inProgress: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      label: 'In Progress'
    }
  };

  // Default to pending if status is not recognized
  const style = statusStyles[status] || statusStyles.pending;

  return (
    <span 
      className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
};

export default EnrollmentStatus;