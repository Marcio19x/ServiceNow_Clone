export interface Ticket {
  id: string;
  title: string;
  description: string;
  category_id: number;
  priority_id: number;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}