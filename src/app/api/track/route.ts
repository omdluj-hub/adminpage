import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { isbot } from 'isbot';
import { UAParser } from 'ua-parser-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { site_id, visited_path, referrer } = body;

    if (!site_id || !visited_path) {
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
      const device = parser.getDevice();
      botName = browser.name || device.model || 'Unknown Bot';
      
      // Additional bot name refinement for common AI bots
      if (userAgent.includes('ChatGPT')) botName = 'ChatGPT-User';
      if (userAgent.includes('Googlebot')) botName = 'Googlebot';
      if (userAgent.includes('bingbot')) botName = 'Bingbot';
      if (userAgent.includes('ClaudeBot')) botName = 'ClaudeBot';
    }

    const supabase = getServiceSupabase();
    
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
      console.error('Error inserting visit:', error);
      return NextResponse.json({ error: 'Failed to log visit' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Tracking API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// OPTIONS for CORS (External sites will call this)
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
