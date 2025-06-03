import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { LayoutDashboard, Ticket, Users, Settings } from 'lucide-react';

interface User {
  email: string;
  role: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await axios.get('http://localhost:4001/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
      } catch (err) {
        setError('Failed to load dashboard');
        localStorage.removeItem('token');
        navigate('/signin');
      }
    };

    // Decode token to show immediate feedback while dashboard loads
    try {
      const decoded = jwtDecode<User>(token);
      setUser(decoded);
      fetchDashboard();
    } catch {
      localStorage.removeItem('token');
      navigate('/signin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <LayoutDashboard className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">ServiceDesk</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="#" className="border-primary-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Tickets
                </a>
                {user.role === 'admin' && (
                  <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Users
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Welcome back, {user.email}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Ticket className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Active Tickets
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              0
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Team Members
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              0
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Settings className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Settings
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              --
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}