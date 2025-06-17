import { Router } from 'express';
import { supabase } from '../auth/supabaseClient';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();

router.post('/signup', async (req, res) => {
  const { email, password, role } = req.body;

  // Validate role
  const validRoles = ['admin', 'agent', 'requester'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in our users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{ 
        email, 
        password: hashedPassword 
      }])
      .select()
      .single();

    if (userError) throw userError;

    // Create role for the user
    const { error: roleError } = await supabase
      .from('roles')
      .insert([{
        user_id: userData.id,
        role: role
      }]);

    if (roleError) {
      // Rollback if role creation fails
      await supabase.from('users').delete().eq('id', userData.id);
      throw roleError;
    }

    const token = jwt.sign(
      { userId: userData.id, email: userData.email, role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // ========================================
    // ⚠️  TEMPORARY TESTING BYPASS - REMOVE BEFORE PRODUCTION ⚠️
    // ========================================
    // This is a hardcoded admin bypass for testing purposes only.
    // This MUST be removed before deploying to production!
    // Files to revert: backend/src/routes/authRoutes.ts (this section)
    if (email === 'admin' && password === 'admin123') {
      console.warn('🚨 WARNING: Using temporary admin bypass - REMOVE BEFORE PRODUCTION! 🚨');
      
      const token = jwt.sign(
        { 
          userId: 'temp-admin-bypass-id', 
          email: 'admin', 
          role: 'admin' 
        },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      return res.json({ token });
    }
    // ========================================
    // END TEMPORARY TESTING BYPASS
    // ========================================

    // Get user from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, userData.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user role
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('role')
      .eq('user_id', userData.id)
      .single();

    if (roleError) throw roleError;

    const token = jwt.sign(
      { userId: userData.id, email: userData.email, role: roleData.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

export default router;