import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

export default function CreateUser() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('requester');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode<{ role: string }>(token);
      setIsAdmin(decoded.role === 'admin');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:4001/api/users',
        { email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/users');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to create user');
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

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New User</h1>

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
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
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
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}