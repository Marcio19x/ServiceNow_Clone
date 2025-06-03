import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { RefreshCw, MessageSquare, Clock, Edit, ArrowLeft } from 'lucide-react';

interface Ticket {
  id: string;
  title: string;
  description: string;
  categories: { name: string };
  priorities: { name: string };
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to: { email: string } | null;
  comments: Comment[];
  ticket_history: TicketHistory[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: { email: string };
}

interface TicketHistory {
  id: number;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
  changed_by: { email: string };
}

export default function TicketDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:4001/api/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTicket(response.data);
      } catch (err) {
        setError('Failed to load ticket details');
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          navigate('/signin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, navigate]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:4001/api/tickets/${id}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh ticket data to get new comment
      const response = await axios.get(`http://localhost:4001/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTicket(response.data);
      setNewComment('');
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded">
          {error || 'Ticket not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            to="/tickets"
            className="inline-flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Tickets
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
        </div>
        <Link
          to={`/tickets/${id}/edit`}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Edit className="w-5 h-5 mr-2" />
          Edit Ticket
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <dl className="grid grid-cols-2 gap-4">
              <dt className="text-gray-500">Status</dt>
              <dd>
                <span className={`px-2 py-1 text-sm font-semibold rounded-full
                  ${ticket.status === 'Open' ? 'bg-green-100 text-green-800' :
                  ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                  ticket.status === 'Resolved' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'}`}>
                  {ticket.status}
                </span>
              </dd>
              <dt className="text-gray-500">Category</dt>
              <dd>{ticket.categories.name}</dd>
              <dt className="text-gray-500">Priority</dt>
              <dd>{ticket.priorities.name}</dd>
              <dt className="text-gray-500">Assigned To</dt>
              <dd>{ticket.assigned_to?.email || 'Unassigned'}</dd>
            </dl>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Comments
            </h2>
          </div>

          <div className="space-y-4 mb-6">
            {ticket.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-900">{comment.author.email}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="space-y-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              rows={3}
              placeholder="Add a comment..."
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Add Comment
            </button>
          </form>
        </div>

        <div className="border-t pt-6 mt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <Clock className="w-5 h-5 mr-2" />
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
          
          {showHistory && (
            <div className="mt-4 space-y-4">
              {ticket.ticket_history.map((history) => (
                <div key={history.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {history.changed_by.email} changed {history.field_changed}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(history.changed_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    From: {history.old_value || 'none'} → To: {history.new_value || 'none'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}