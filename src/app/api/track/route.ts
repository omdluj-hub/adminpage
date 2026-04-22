import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { isbot } from 'isbot';
import { UAParser } from 'ua-parser-js';

export async function POST(req: NextRequest) {
  console.log('--- Tracking Request Received ---');
  try {
    const body = await req.json();
    console.log('Payload:', JSON.stringify(body));

    const { site_id, visited_path, path, referrer } = body;
    const actualPath = visited_path || path;

    if (!site_id || !actualPath) {
      console.warn('Missing required fields:', { site_id, visited_path, path });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    // Bot detection
    const isBotVisit = isbot(userAgent);
    let bot_name = null;

    if (isBotVisit) {
      const parser = new UAParser(userAgent);
      const browser = parser.getBrowser();
      bot_name = browser.name || 'Unknown Bot';
      if (userAgent.includes('ChatGPT')) bot_name = 'ChatGPT-User';
    }

    const supabase = getServiceSupabase();
    
    console.log('Inserting into Supabase with safe values...');
    const { error } = await supabase
      .from('site_visits')
      .insert({
        site_id: String(site_id).substring(0, 50),
        ip_address: String(ip).substring(0, 50),
        referrer: String(referrer || 'direct').substring(0, 255),
        user_agent: String(userAgent).substring(0, 500),
        is_bot: !!isBotVisit,
        bot_name: bot_name ? String(bot_name).substring(0, 100) : null,
        visited_path: String(actualPath).substring(0, 255)
      });

    if (error) {
      console.error('Supabase Error Full Object:', JSON.stringify(error));
      return NextResponse.json({ error: 'Failed to log visit', details: error }, { status: 500 });
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
