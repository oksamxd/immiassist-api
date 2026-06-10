const fs = require('fs');
const path = require('path');

async function run() {
  const email = `test-${Date.now()}@test.com`;
  
  // 1. Register
  const regRes = await fetch('http://localhost:3001/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password: 'password123' })
  });
  const regData = await regRes.json();
  console.log('Register:', regData);

  // 2. Login
  const loginRes = await fetch('http://localhost:3001/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  // 3. Upload Document
  const filePath = path.join(__dirname, 'test-doc.txt');
  fs.writeFileSync(filePath, 'Hello World');
  
  const blob = new Blob([fs.readFileSync(filePath)], { type: 'text/plain' });
  const formData = new FormData();
  formData.append('file', blob, 'test-doc.txt');

  const uploadRes = await fetch('http://localhost:3001/api/documents/onboarding?type=PASSPORT', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  console.log('Upload Status:', uploadRes.status);
  const uploadText = await uploadRes.text();
  console.log('Upload Response:', uploadText);
}

run().catch(console.error);
