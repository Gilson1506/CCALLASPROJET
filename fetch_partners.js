const supabaseUrl = 'https://xaygqvtrkxlcvukxcziz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhheWdxdnRya3hsY3Z1a3hjeml6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MTY3MTYsImV4cCI6MjA4Njk5MjcxNn0.kbBs83Sn8d3czoVdf_mZSd3WceGlnAh1gIXVbo920tA';

async function fetchPartners() {
    const url = `${supabaseUrl}/rest/v1/partners?select=logo`;
    try {
        const response = await fetch(url, {
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        const data = await response.json();
        data.forEach(p => {
            console.log('LOGO Length:', p.logo ? p.logo.length : 'null');
            console.log('LOGO Encoded:', p.logo ? encodeURIComponent(p.logo) : 'null');
            console.log('LOGO Raw:', JSON.stringify(p.logo));
        });
    } catch (error) {
        console.error('Error fetching:', error);
    }
}

fetchPartners();
