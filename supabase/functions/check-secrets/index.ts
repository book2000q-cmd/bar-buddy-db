import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if required secrets exist (without exposing their values)
    const secrets = {
      GOOGLE_SERVICE_ACCOUNT_EMAIL: !!Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: !!Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'),
      GOOGLE_SPREADSHEET_ID: !!Deno.env.get('GOOGLE_SPREADSHEET_ID'),
    };

    return new Response(
      JSON.stringify({ secrets }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error checking secrets:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
