const supabaseUrl = 'https://xaygqvtrkxlcvukxcziz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhheWdxdnRya3hsY3Z1a3hjeml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTY3MTYsImV4cCI6MjA4Njk5MjcxNn0.kbBs83Sn8d3czoVdf_mZSd3WceGlnAh1gIXVbo920tA';

async function listFiles() {
    const url = `${supabaseUrl}/storage/v1/object/list/images`; // Changed bucket to 'images'
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prefix: 'partners', // added prefix
                limit: 100
            })
        });

        if (!response.ok) {
            console.log(`Error: ${response.status} ${response.statusText}`);
            return;
        }

        const data = await response.json();
        console.log('Files in "images" bucket (partners folder):', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error fetching:', error);
    }
}

listFiles();
