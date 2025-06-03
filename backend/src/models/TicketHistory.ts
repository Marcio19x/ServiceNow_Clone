export interface TicketHistory {
  id: number;
  ticket_id: string;
  changed_by: string;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
}