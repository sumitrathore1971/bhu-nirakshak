// Test script to verify image display functionality
console.log('=== Image Display Test ===');

// Test 1: Check if backend server is running
async function testBackendServer() {
  try {
    const response = await fetch('http://localhost:8080/');
    const data = await response.json();
    console.log('✅ Backend server is running:', data);
    return true;
  } catch (error) {
    console.log('❌ Backend server is not running:', error.message);
    return false;
  }
}

// Test 2: Check if static file serving is working
async function testStaticFileServing() {
  try {
    const response = await fetch('http://localhost:8080/uploads/test.jpg');
    if (response.ok) {
      console.log('✅ Static file serving is working');
      return true;
    } else {
      console.log('❌ Static file serving failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Static file serving error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n1. Testing backend server...');
  const serverOk = await testBackendServer();
  
  console.log('\n2. Testing static file serving...');
  const staticOk = await testStaticFileServing();
  
  console.log('\n=== Test Results ===');
  console.log(`Backend Server: ${serverOk ? '✅' : '❌'}`);
  console.log(`Static Files: ${staticOk ? '✅' : '❌'}`);
  
  if (serverOk && staticOk) {
    console.log('\n🎉 All tests passed! Image display should work.');
    console.log('\nNext steps:');
    console.log('1. Submit a report with actual image files');
    console.log('2. View the report details to see images');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the issues above.');
  }
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests();
}
