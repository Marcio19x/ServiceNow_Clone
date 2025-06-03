import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Priority {
  id: number;
  name: string;
}

export default function CreateTicket() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priorityId, setPriorityId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [categoriesRes, prioritiesRes] = await Promise.all([
          axios.get('http://localhost:4001/api/categories', { headers }),
          axios.get('http://localhost:4001/api/priorities', { headers })
        ]);

        setCategories(categoriesRes.data);
        setPriorities(prioritiesRes.data);
      } catch (err) {
        setError('Failed to load form data');
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate('/signin');
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:4001/api/tickets',
        {
          title,
          description,
          categoryId: parseInt(categoryId),
          priorityId: parseInt(priorityId)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      navigate(`/tickets/${response.data.id}`);
    } catch (err) {
      setError('Failed to create ticket');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Ticket</h1>

        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              value={priorityId}
              onChange={(e) => setPriorityId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            >
              <option value="">Select a priority</option>
              {priorities.map((priority) => (
                <option key={priority.id} value={priority.id}>
                  {priority.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <Save className="w-5 h-5 mr-2" />
              Create Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}