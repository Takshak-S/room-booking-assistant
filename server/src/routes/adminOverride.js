import express from 'express';
import supabase from '../lib/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

async function requireAdmin(userId) {
  const { data } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();

  return data?.is_admin === true;
}

router.post(
  '/admin/bookings/:bookingId/override',
  requireAuth,
  async (req, res) => {
    const adminId = req.user.id;
    const { bookingId } = req.params;
    const {
      new_resource_id,
      new_start_time,
      new_end_time,
      reason
    } = req.body;

    if (
      !new_resource_id ||
      !new_start_time ||
      !new_end_time ||
      !reason
    ) {
      return res.status(400).json({
        error: 'All fields are required'
      });
    }

    if (!(await requireAdmin(adminId))) {
      return res.status(403).json({
        error: 'Admin access required'
      });
    }

    // fetch original booking
    const { data: original, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error || !original) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    if (
      !['APPROVED', 'PENDING_APPROVAL'].includes(original.status)
    ) {
      return res.status(409).json({
        error: 'Only active bookings can be overridden'
      });
    }

    // conflict check for new slot
    const { data: conflict } = await supabase
      .from('bookings')
      .select('id')
      .eq('resource_id', new_resource_id)
      .in('status', ['PENDING_APPROVAL', 'APPROVED'])
      .lt('start_time', new_end_time)
      .gt('end_time', new_start_time)
      .maybeSingle();

    if (conflict) {
      return res.status(409).json({
        error: 'New slot conflicts with existing booking'
      });
    }

    // create new booking
    const { data: newBooking, error: insertError } =
      await supabase
        .from('bookings')
        .insert({
          resource_id: new_resource_id,
          created_by_user_id: original.created_by_user_id,
          acting_as_type: original.acting_as_type,
          acting_as_id: original.acting_as_id,
          start_time: new_start_time,
          end_time: new_end_time,
          purpose: original.purpose,
          status: 'APPROVED'
        })
        .select()
        .single();

    if (insertError) {
      return res.status(500).json({
        error: insertError.message
      });
    }

    // mark original booking as overridden
    await supabase
      .from('bookings')
      .update({
        status: 'OVERRIDDEN',
        replaced_by_booking_id: newBooking.id,
        admin_note: reason
      })
      .eq('id', bookingId);

    // history: overridden
    await supabase.from('booking_events').insert({
      booking_id: bookingId,
      event_type: 'OVERRIDDEN',
      created_by: adminId,
      metadata: {
        reason,
        new_booking_id: newBooking.id
      }
    });

    // history: new booking created
    await supabase.from('booking_events').insert({
      booking_id: newBooking.id,
      event_type: 'CREATED_BY_OVERRIDE',
      created_by: adminId,
      metadata: {
        replaced_booking_id: bookingId
      }
    });

    res.json({
      success: true,
      old_booking_id: bookingId,
      new_booking_id: newBooking.id
    });
  }
);

export default router;
