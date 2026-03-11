import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
    }

    const { scheduleId, memberId, ministryId, scheduledFor, assignmentDate } = await request.json();

    if (!scheduleId || !memberId || !ministryId || !scheduledFor) {
      throw new Error('scheduleId, memberId, ministryId, and scheduledFor are required.');
    }

    const notificationDate = new Date(scheduledFor);

    if (Number.isNaN(notificationDate.getTime())) {
      throw new Error('scheduledFor must be a valid ISO timestamp.');
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase.from('notification_jobs').insert({
      schedule_id: scheduleId,
      member_id: memberId,
      ministry_id: ministryId,
      scheduled_for: notificationDate.toISOString(),
      payload: {
        title: 'Upcoming ministry assignment',
        body: `You are scheduled to serve on ${assignmentDate}.`,
        assignmentDate,
      },
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        queued: true,
        scheduledFor: notificationDate.toISOString(),
      }),
      {
        headers: corsHeaders,
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unexpected error.',
      }),
      {
        headers: corsHeaders,
        status: 400,
      },
    );
  }
});
