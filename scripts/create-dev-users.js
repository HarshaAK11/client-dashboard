// Dev seeding script: creates three users (admin, manager, agent)
// Usage:
// 1. Ensure .env.local contains SUPABASE URL and ANON key (and SERVICE_ROLE key if available).
// 2. Run: node scripts/create-dev-users.js

(async () => {
  try {
    try { require('dotenv').config({ path: '.env.local' }); } catch (e) { try { require('dotenv').config(); } catch(e2) {} }

    const { createClient } = require('@supabase/supabase-js');
    const crypto = require('crypto');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !anonKey) {
      console.error('Missing SUPABASE URL or ANON key. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local');
      process.exit(1);
    }

    const client = createClient(url, anonKey);
    const adminClient = serviceKey ? createClient(url, serviceKey) : null;

    const users = [
      { email: 'admin@example.com', password: 'Admin@12345', full_name: 'Admin User', role: 'admin' },
      { email: 'manager@example.com', password: 'Manager@12345', full_name: 'Manager User', role: 'manager' },
      { email: 'agent@example.com', password: 'Agent@12345', full_name: 'Agent User', role: 'agent' },
    ];

    console.log('Creating dev users...');

    const results = [];

    for (const u of users) {
      const record = { email: u.email, password: u.password, role: u.role, createdAuth: false, createdProfile: false, id: null, note: '' };

      if (adminClient) {
        // Use service role key to create auth user and profile (bypass RLS)
        try {
          const res = await adminClient.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
          });

          if (res.user && res.user.id) {
            record.createdAuth = true;
            record.id = res.user.id;

            const tenantId = crypto.randomUUID();
            const deptId = u.role === 'manager' || u.role === 'agent' ? crypto.randomUUID() : null;

            const { error: insertErr } = await adminClient.from('users').insert([{ id: record.id, email: u.email, full_name: u.full_name, role: u.role, tenant_id: tenantId, department_id: deptId }]);
            if (insertErr) {
              record.note = 'Auth created but failed to insert profile: ' + insertErr.message;
            } else {
              record.createdProfile = true;
            }
          } else if (res.error) {
            record.note = 'Admin createUser error: ' + JSON.stringify(res.error);
          }
        } catch (e) {
          record.note = 'Admin path error: ' + e.message;
        }
      } else {
        // Use anon to sign up (may require dev-mode auth settings on local Supabase)
        try {
          const { data, error } = await client.auth.signUp({ email: u.email, password: u.password });
          if (error) {
            record.note = 'Sign-up error: ' + error.message;
          } else if (data && data.user && data.user.id) {
            record.createdAuth = true;
            record.id = data.user.id;

            // Attempt to create profile (may fail if RLS blocks anonymous writes)
            const tenantId = crypto.randomUUID();
            const deptId = u.role === 'manager' || u.role === 'agent' ? crypto.randomUUID() : null;
            const { error: insertErr } = await client.from('users').insert([{ id: record.id, email: u.email, full_name: u.full_name, role: u.role, tenant_id: tenantId, department_id: deptId }]);
            if (insertErr) {
              record.note = 'Profile insert failed (likely RLS): ' + insertErr.message;
            } else {
              record.createdProfile = true;
            }
          }
        } catch (e) {
          record.note = 'Anon path error: ' + e.message;
        }
      }

      results.push(record);
    }

    console.log('\nResults:\n');
    results.forEach(r => {
      console.log(`- ${r.email} (${r.role})`);
      console.log(`  password: ${r.password}`);
      console.log(`  auth created: ${r.createdAuth}`);
      console.log(`  profile created: ${r.createdProfile}`);
      if (r.id) console.log(`  id: ${r.id}`);
      if (r.note) console.log(`  note: ${r.note}`);
      console.log('');
    });

    console.log('Done. If profiles failed to insert you may need to provide SUPABASE_SERVICE_ROLE_KEY in your .env.local and re-run the script.');
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
})();
