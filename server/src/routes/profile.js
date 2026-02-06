import express from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * STUDENT PROFILE COMPLETION
 */
router.post('/profile/student', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { name, register_number, mobile_number } = req.body;

  if (!name || !register_number || !mobile_number) {
    return res.status(400).json({
      error: 'All fields are required'
    });
  }

  // Fetch user
  const { data: user, error } = await supabase
    .from('users')
    .select('role, profile_completed')
    .eq('id', userId)
    .single();

  if (!user || user.role !== 'STUDENT') {
    return res.status(403).json({ error: 'Not a student account' });
  }

  if (user.profile_completed) {
    return res.status(409).json({
      error: 'Profile already completed'
    });
  }

  // Insert student profile
  const { error: insertError } = await supabase
    .from('student_profiles')
    .insert({
      user_id: userId,
      name,
      register_number,
      mobile_number
    });

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  // Mark profile completed
  await supabase
    .from('users')
    .update({ profile_completed: true })
    .eq('id', userId);

  return res.json({
    success: true,
    message: 'Student profile completed'
  });
});

/**
 * FACULTY PROFILE COMPLETION
 */
router.post('/profile/faculty', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { name, employee_id, school, mobile_number } = req.body;

  if (!name || !employee_id || !mobile_number) {
    return res.status(400).json({
      error: 'Required fields missing'
    });
  }

  const { data: user } = await supabase
    .from('users')
    .select('role, profile_completed')
    .eq('id', userId)
    .single();

  if (!user || user.role !== 'FACULTY') {
    return res.status(403).json({ error: 'Not a faculty account' });
  }

  if (user.profile_completed) {
    return res.status(409).json({
      error: 'Profile already completed'
    });
  }

  const { error: insertError } = await supabase
    .from('faculty_profiles')
    .insert({
      user_id: userId,
      name,
      employee_id,
      school,
      mobile_number
    });

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  await supabase
    .from('users')
    .update({ profile_completed: true })
    .eq('id', userId);

  return res.json({
    success: true,
    message: 'Faculty profile completed'
  });
});


export default router;
