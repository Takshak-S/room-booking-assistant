import express from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { inferRoleFromEmail } from '../utils/inferRole.js';

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
  const { id, email } = req.user;

  // check if user exists in public.users
  const { data: userRow, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  // if user does not exist → first login
  if (!userRow) {
    const role = inferRoleFromEmail(email);

    if (!role) {
      return res.status(403).json({
        error: 'Unauthorized email domain'
      });
    }

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id,
        role,
        profile_completed: false
      });

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    return res.json({
      role,
      profile_completed: false
    });
  }

  // existing user
  return res.json({
    role: userRow.role,
    profile_completed: userRow.profile_completed,
    is_admin: userRow.is_admin
  });
});

export default router;
