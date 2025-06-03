import { Router } from 'express';
import { supabase } from '../auth/supabaseClient';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = Router();

// List tickets
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('tickets')
      .select(`
        *,
        categories (name),
        priorities (name),
        assigned_to:users!assigned_to (email)
      `)
      .range(offset, offset + limit - 1);

    if (req.user?.role === 'requester') {
      query = query.eq('created_by', req.user.userId);
    }

    const { data: tickets, error } = await query;

    if (error) throw error;
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get single ticket
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        categories (name),
        priorities (name),
        assigned_to:users!assigned_to (email),
        comments (
          id,
          content,
          created_at,
          author:users!author_id (email)
        ),
        ticket_history (
          id,
          field_changed,
          old_value,
          new_value,
          changed_at,
          changed_by:users!changed_by (email)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create ticket
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { title, description, categoryId, priorityId } = req.body;

  try {
    const { data: ticket, error } = await supabase
      .from('tickets')
      .insert({
        title,
        description,
        category_id: categoryId,
        priority_id: priorityId,
        created_by: req.user!.userId,
        status: 'Open'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update ticket
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { title, description, status, assignedTo } = req.body;
  const ticketId = req.params.id;

  try {
    // Get current ticket state
    const { data: currentTicket, error: fetchError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (fetchError) throw fetchError;
    if (!currentTicket) return res.status(404).json({ error: 'Ticket not found' });

    // Prepare update data
    const updates: any = {};
    const isAgentOrAdmin = ['agent', 'admin'].includes(req.user!.role);
    const isOwner = currentTicket.created_by === req.user!.userId;

    if (isAgentOrAdmin) {
      if (status) updates.status = status;
      if (assignedTo) updates.assigned_to = assignedTo;
    }

    if (isOwner || isAgentOrAdmin) {
      if (title) updates.title = title;
      if (description) updates.description = description;
    }

    // Update ticket
    const { data: updatedTicket, error: updateError } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Record history
    const historyPromises = Object.entries(updates).map(([field, newValue]) =>
      supabase.from('ticket_history').insert({
        ticket_id: ticketId,
        changed_by: req.user!.userId,
        field_changed: field,
        old_value: currentTicket[field],
        new_value: newValue
      })
    );

    await Promise.all(historyPromises);

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete ticket
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;