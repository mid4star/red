import fetch from 'node-fetch';

async function testIsolation() {
  const baseUrl = 'http://localhost:3000/api';
  
  // 1. Login as Admin
  let adminRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId: 'ADMIN-01', password: 'admin' })
  });
  let adminCookieStr = adminRes.headers.get('set-cookie');
  console.log('--- ADMIN LOGIN ---');

  // Fetch Patrols as Admin
  let adminPatrolsRes = await fetch(`${baseUrl}/staff/query?collection=patrols`, {
    headers: { 'Cookie': adminCookieStr }
  });
  let adminPatrols = await adminPatrolsRes.json();
  console.log(`Admin sees ${adminPatrols.data?.length || 0} patrols.`);

  // 2. Login as Monitor (Wadi El Gemal)
  let monRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId: 'MON-102', password: 'password' })
  });
  let monCookieStr = monRes.headers.get('set-cookie');
  console.log('\n--- MONITOR LOGIN ---');

  // Fetch Patrols as Monitor
  let monPatrolsRes = await fetch(`${baseUrl}/staff/query?collection=patrols`, {
    headers: { 'Cookie': monCookieStr }
  });
  let monPatrols = await monPatrolsRes.json();
  console.log(`Monitor sees ${monPatrols.data?.length || 0} patrols.`);
  
  // 3. Test creating a Patrol as Monitor
  console.log('\n--- Creating new Patrol as Monitor ---');
  let addRes = await fetch(`${baseUrl}/staff/mutate`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': monCookieStr
    },
    body: JSON.stringify({
      collectionName: 'patrols',
      action: 'ADD',
      data: {
        code: 'PAT-TEST-001',
        zone: 'Test Zone',
        status: 'COMPLETED',
        date: new Date().toISOString(),
      }
    })
  });
  let addData = await addRes.json();
  console.log('Create Response:', addData.data?.code ? 'SUCCESS' : addData);

  // Fetch Patrols again as Monitor
  let monPatrolsRes2 = await fetch(`${baseUrl}/staff/query?collection=patrols`, {
    headers: { 'Cookie': monCookieStr }
  });
  let monPatrols2 = await monPatrolsRes2.json();
  console.log(`Monitor now sees ${monPatrols2.data?.length || 0} patrols.`);
  if (monPatrols2.data && monPatrols2.data.length > 0) {
    console.log(`First patrol reserveId: ${monPatrols2.data[0].reserveId}`);
  }

}

testIsolation().catch(console.error);
