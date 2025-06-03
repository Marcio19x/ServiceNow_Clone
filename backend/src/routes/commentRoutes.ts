import { Router } from 'express';
import { supabase } from '../auth/supabaseClient';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Get comments for a ticket
router.get('/:ticketId/comments', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users!author_id (email)
      `)
      .eq('ticket_id', req.params.ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Add comment to ticket
router.post('/:ticketId/comments', authMiddleware, async (req: AuthRequest, res) => {
  const { content } = req.body;
  const ticketId = req.params.ticketId;

  try {
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        ticket_id: ticketId,
        author_id: req.user!.userId,
        content
      })
      .select(`
        *,
        author:users!author_id (email)
      `)
      .single();

    if (error) throw error;
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;