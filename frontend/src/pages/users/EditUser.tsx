import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Save, RefreshCw, ArrowLeft } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  role: string;
}

export default function EditUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode<{ role: string }>(token);
      setIsAdmin(decoded.role === 'admin');
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:4001/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = response.data;
        setUser(userData);
        setEmail(userData.email);
        setRole(userData.role);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to load user');
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

    fetchUser();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updates: any = { role };
      if (password) {
        updates.password = password;
      }

      await axios.put(
        `http://localhost:4001/api/users/${id}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/users');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to update user');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
          {error || 'User not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/users"
          className="inline-flex items-center px-4 py-2 mb-6 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Users
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit User</h1>

        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="requester">Requester</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}