const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedUser() {
    const email = 'demo@example.com';
    const password = 'Password123!';

    console.log(`Seeding user: ${email}`);
    console.log(`Password: ${password}`);

    const { data, error } = await supabase
        .from('temp_auth_users')
        .upsert({
            email: email.toLowerCase(),
            password: password,
        }, { onConflict: 'email' })
        .select();

    if (error) {
        console.error('Error seeding user:', error);
    } else {
        console.log('User seeded successfully:', data);
    }
}

seedUser();

