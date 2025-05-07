// components/LawyerLayout.jsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaHome, FaGavel, FaCalendarAlt, FaCog, FaSignOutAlt, FaComment, FaUser, FaFileAlt } from "react-icons/fa";
import useLawyerAuth from "../store/useLawyerAuthProvider";

export function LawyerLayout({ children, lawyerId }) {
  const router = useRouter();
  const { user, logout } = useLawyerAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLogout = () => {
    // Clear cookies
    document.cookie = "refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    
    // Clear user state
    logout();
    
    // Redirect to login
    router.push('/lawyerLoginPage');
  };

  const navItems = [
    {
      label: 'Dashboard',
      icon: <FaHome className="w-5 h-5" />,
      href: '/lawyerDashboard',
    },
    {
      label: 'Cases',
      icon: <FaGavel className="w-5 h-5" />,
      href: '/lawyerCases',
    },
    {
      label: 'Documents',
      icon: <FaFileAlt className="w-5 h-5" />,
      href: '/lawyerDocuments',
    },
    {
      label: 'Appointments',
      icon: <FaCalendarAlt className="w-5 h-5" />,
      href: '/lawyerAppointments',
    },
    {
      label: 'Clients',
      icon: <FaUser className="w-5 h-5" />,
      href: '/lawyerClients',
    },
    {
      label: 'Settings',
      icon: <FaCog className="w-5 h-5" />,
      href: '/lawyerSettings',
    },
  ];

  return (
    <div className="h-screen flex flex-col relative bg-blue-50">
      <div className="fixed top-0 w-full z-50 bg-white shadow-md">
        <div className="flex justify-between items-center px-4 py-2">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Justice Connect</h1>
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">Lawyer</span>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.lawyer?.specialty || 'Lawyer'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex pt-16">
        <aside className="hidden md:block w-64 bg-blue-100 p-4">
          <nav className="mt-4">
            <ul className="space-y-2">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link href={item.href} legacyBehavior>
                    <a className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-200 hover:text-blue-600 rounded-md transition-colors">
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </a>
                  </Link>
                </li>
              ))}
              <li>
                <button 
                  onClick={handleLogout}
                  className="flex items-center px-4 py-3 w-full text-left text-gray-700 hover:bg-red-100 hover:text-red-500 rounded-md transition-colors"
                >
                  <span className="mr-3"><FaSignOutAlt className="w-5 h-5" /></span>
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </aside>
        
        <main className="flex-1 p-4 overflow-auto">{children}</main>
        
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition"
          aria-label="Chat"
        >
          <FaComment className="w-6 h-6" />
        </button>
        
        {isChatOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-96 flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="font-bold">Client Messages</h2>
                <button 
                  onClick={() => setIsChatOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {/* Chat messages would go here */}
                <p className="text-center text-gray-500 mt-20">
                  You have no active chat sessions
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LawyerLayout;