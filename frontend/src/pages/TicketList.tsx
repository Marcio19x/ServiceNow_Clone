import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, RefreshCw } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  categories: { name: string };
  priorities: { name: string };
  status: string;
  created_at: string;
  assigned_to: { email: string } | null;
}

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4001/api/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load tickets');
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [navigate]);

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
        <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        <Link
          to="/tickets/new"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Ticket
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.id.slice(0, 8)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.categories.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.priorities.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${ticket.status === 'Open' ? 'bg-green-100 text-green-800' :
                    ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    ticket.status === 'Resolved' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.assigned_to?.email || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/tickets/${ticket.id}`}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    View Details
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