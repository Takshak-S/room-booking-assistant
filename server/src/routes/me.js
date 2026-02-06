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

router.get('/me/clubs', requireAuth, async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('club_members')
    .select(`
      club_id,
      designation,
      clubs ( name )
    `)
    .eq('user_id', userId)
    .eq('role', 'BOARD')
    .eq('is_active', true);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(
    data.map(row => ({
      club_id: row.club_id,
      club_name: row.clubs.name,
      designation: row.designation
    }))
  );
});


export default router;
