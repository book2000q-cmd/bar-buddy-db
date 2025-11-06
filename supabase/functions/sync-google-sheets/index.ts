import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

async function getGoogleAccessToken(): Promise<string> {
  const serviceAccountEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')?.replace(/\\n/g, '\n');
  
  if (!serviceAccountEmail || !privateKey) {
    throw new Error('Missing Google Service Account credentials');
  }

  const jwtHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const jwtClaimSet = btoa(JSON.stringify({
    iss: serviceAccountEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));

  const signatureInput = `${jwtHeader}.${jwtClaimSet}`;
  
  // Import the private key
  const keyData = privateKey.match(/-----BEGIN PRIVATE KEY-----\n([\s\S]+?)\n-----END PRIVATE KEY-----/);
  if (!keyData) {
    throw new Error('Invalid private key format');
  }
  
  const pemContents = keyData[1].replace(/\n/g, '');
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${jwtHeader}.${jwtClaimSet}.${signatureBase64}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData: GoogleAuthToken = await tokenResponse.json();
  return tokenData.access_token;
}

async function updateGoogleSheet(accessToken: string, spreadsheetId: string, data: any) {
  const sheets = [
    { name: 'Products', data: data.products, headers: ['ID', 'Name', 'Barcode', 'Price', 'Stock', 'Category', 'Updated At'] },
    { name: 'Transactions', data: data.transactions, headers: ['ID', 'Date', 'Total Amount', 'Items Count'] },
    { name: 'Expenses', data: data.expenses, headers: ['ID', 'Date', 'Category', 'Amount', 'Description'] },
  ];

  for (const sheet of sheets) {
    // Clear existing data
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheet.name}!A1:Z1000:clear`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Prepare values
    const values = [sheet.headers, ...sheet.data];

    // Update with new data
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheet.name}!A1?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      }
    );
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const spreadsheetId = Deno.env.get('GOOGLE_SPREADSHEET_ID');

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching data from database...');

    // Fetch products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    // Fetch transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (transactionsError) throw transactionsError;

    // Fetch expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });

    if (expensesError) throw expensesError;

    console.log('Data fetched successfully');

    // Format data for Google Sheets
    const productsData = products.map(p => [
      p.id,
      p.name,
      p.barcode,
      p.price || 0,
      p.stock_quantity || 0,
      p.category || '',
      new Date(p.updated_at).toLocaleString('th-TH'),
    ]);

    const transactionsData = transactions.map(t => [
      t.id,
      new Date(t.transaction_date).toLocaleString('th-TH'),
      t.total_amount,
      Array.isArray(t.items) ? t.items.length : 0,
    ]);

    const expensesData = expenses.map(e => [
      e.id,
      new Date(e.expense_date).toLocaleString('th-TH'),
      e.category || '',
      e.amount,
      e.description,
    ]);

    console.log('Getting Google access token...');
    const accessToken = await getGoogleAccessToken();

    console.log('Updating Google Sheets...');
    await updateGoogleSheet(accessToken, spreadsheetId, {
      products: productsData,
      transactions: transactionsData,
      expenses: expensesData,
    });

    console.log('Sync completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Data synced to Google Sheets successfully',
        stats: {
          products: products.length,
          transactions: transactions.length,
          expenses: expenses.length,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error syncing to Google Sheets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
