async function checkImage() {
    // exact URL from previous output
    const url = 'https://xaygqvtrkxlcvukxcziz.supabase.co/storage/v1/object/public/partners/17714168071937_itv5hg glcnb.png';
    const encodedUrl = encodeURI(url);

    console.log('Testing URL:', encodedUrl);

    try {
        const response = await fetch(encodedUrl);
        console.log('Status:', response.status);
        console.log('StatusText:', response.statusText);
        console.log('Content-Type:', response.headers.get('content-type'));

        if (response.ok) {
            console.log('Image is accessible!');
        } else {
            console.log('Image is NOT accessible.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

checkImage();
