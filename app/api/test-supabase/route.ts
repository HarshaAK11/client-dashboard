import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      throw new Error('Missing Supabase admin credentials');
    }

    // Try to fetch any data from any table
    const { data, error } = await supabase
      .from('email_events')  // Replace with your table name
      .select('*')
      .limit(1);


    if (error) {
      return Response.json({
        status: 'error',
        message: error.message,
        details: error
      }, { status: 400 });
    }

    return Response.json({
      status: 'connected',
      message: 'Supabase connection successful',
      data: data
    });
  } catch (error) {
    return Response.json({
      status: 'error',
      message: (error as Error).message
    }, { status: 500 });
  }
}