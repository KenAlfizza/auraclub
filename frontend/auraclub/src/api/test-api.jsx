// Run this in browser console
async function testAPI() {
  try {
    console.log('Testing API...')
    const response = await fetch('http://localhost:3000/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        utorid: 'testuser', 
        password: 'testpass' 
      })
    })
    
    console.log('Response status:', response.status)
    const data = await response.json()
    console.log('Response data:', data)
    return data
  } catch (err) {
    console.error('Error:', err)
  }
}

testAPI()