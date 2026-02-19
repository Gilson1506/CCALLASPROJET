// Run SQL schema against Supabase using the REST API
// Usage: node supabase/run-schema.mjs

const SUPABASE_URL = 'https://xaygqvtrkxlcvukxcziz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhheWdxdnRya3hsY3Z1a3hjeml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTY3MTYsImV4cCI6MjA4Njk5MjcxNn0.kbBs83Sn8d3czoVdf_mZSd3WceGlnAh1gIXVbo920tA';

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

// Split into individual statements and run each
const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`Found ${statements.length} SQL statements to execute.\n`);

let success = 0;
let failed = 0;

for (const stmt of statements) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: stmt }),
        });

        if (!response.ok) {
            const shortStmt = stmt.substring(0, 60).replace(/\n/g, ' ');
            console.log(`⚠ Statement may need dashboard: ${shortStmt}...`);
            failed++;
        } else {
            success++;
        }
    } catch (err) {
        failed++;
    }
}

console.log(`\nResults: ${success} succeeded, ${failed} need manual execution.`);
console.log(`\n📋 Copy the contents of schema.sql and run them in the Supabase SQL Editor:`);
console.log(`   ${SUPABASE_URL.replace('.supabase.co', '')}/sql/new`);
console.log(`\n   Or go to: https://supabase.com/dashboard → Your Project → SQL Editor → New Query`);
console.log(`   Paste the entire schema.sql content and click "Run"\n`);
