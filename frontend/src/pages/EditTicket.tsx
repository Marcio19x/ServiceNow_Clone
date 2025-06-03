import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Save, RefreshCw, ArrowLeft } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

interface User {
  userId: string;
  email: string;
  role: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  assigned_to: string | null;
  created_by: string;
}

interface Agent {
  id: string;
  email: string;
}

export default function EditTicket() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode<User>(token);
      setUser(decoded);
    }
  }, []);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:4001/api/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ticketData = response.data;
        setTicket(ticketData);
        setTitle(ticketData.title);
        setDescription(ticketData.description);
        setStatus(ticketData.status);
        setAssignedTo(ticketData.assigned_to?.id || '');

        // If user is agent/admin, fetch available agents
        if (user?.role === 'agent' || user?.role === 'admin') {
          const agentsResponse = await axios.get('http://localhost:4001/api/users?role=agent', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAgents(agentsResponse.data);
        }
      } catch (err) {
        setError('Failed to load ticket');
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate('/signin');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTicket();
    }
  }, [id, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updates: any = {};

      if (user?.role === 'requester' && ticket?.created_by === user.userId) {
        updates.title = title;
        updates.description = description;
      }

      if (user?.role === 'agent' || user?.role === 'admin') {
        updates.status = status;
        updates.assignedTo = assignedTo || null;
      }

      await axios.put(
        `http://localhost:4001/api/tickets/${id}`,
        updates,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate(`/tickets/${id}`);
    } catch (err) {
      setError('Failed to update ticket');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!ticket || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
          {error || 'Ticket not found'}
        </div>
      </div>
    );
  }

  const canEditContent = user.role === 'requester' && ticket.created_by === user.userId;
  const canEditStatus = user.role === 'agent' || user.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/tickets"
          className="inline-flex items-center px-4 py-2 mb-6 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Tickets
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Ticket</h1>

        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {canEditContent && (
            <>
              <div>
                <label htmlFor="title\" className="block text-sm font-medium text-gray-700">
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
            </>
          )}

          {canEditStatus && (
            <>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                  Assign To
                </label>
                <select
                  id="assignedTo"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">Unassigned</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.email}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

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