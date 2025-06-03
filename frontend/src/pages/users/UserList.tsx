import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, RefreshCw, UserCog } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode<{ role: string }>(token);
      setIsAdmin(decoded.role === 'admin');
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4001/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to load users');
          if (err.response?.status === 401) {
            navigate('/signin');
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
          You don't have permission to view this page.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Link
          to="/users/new"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New User
        </Link>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'agent' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/users/${user.id}/edit`}
                    className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                  >
                    <UserCog className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}