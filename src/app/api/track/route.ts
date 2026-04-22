import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { isbot } from 'isbot';
import { UAParser } from 'ua-parser-js';

export async function POST(req: NextRequest) {
  console.log('--- Tracking Request Received ---');
  try {
    const body = await req.json();
    console.log('Payload:', JSON.stringify(body));

    const { site_id, visited_path, referrer } = body;

    if (!site_id || !visited_path) {
      console.warn('Missing required fields:', { site_id, visited_path });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    // Bot detection
    const isBotVisit = isbot(userAgent);
    let botName = null;

    if (isBotVisit) {
      const parser = new UAParser(userAgent);
      const browser = parser.getBrowser();
      botName = browser.name || 'Unknown Bot';
      if (userAgent.includes('ChatGPT')) botName = 'ChatGPT-User';
    }

    const supabase = getServiceSupabase();
    
    console.log('Inserting into Supabase...');
    const { error } = await supabase
      .from('site_visits')
      .insert({
        site_id,
        ip_address: ip,
        referrer: referrer || 'direct',
        user_agent: userAgent,
        is_bot: isBotVisit,
        bot_name: botName,
        visited_path
      });

    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json({ error: 'Failed to log visit', details: error.message }, { status: 500 });
    }

    console.log('Successfully logged visit for:', site_id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Tracking API Crash:', err.message);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}

// OPTIONS for CORS (Crucial for cross-domain requests)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
