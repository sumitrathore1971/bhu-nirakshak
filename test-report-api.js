// Test script for Report API endpoints
// Run this after starting the backend server

const API_BASE_URL = 'http://localhost:8080/api';

// Test data
const testReport = {
  fullName: 'John Doe',
  phone: '9876543210',
  email: 'john.doe@example.com',
  title: 'Test Land Encroachment Report',
  description: 'This is a test report for land encroachment in the area.',
  category: 'Public Land',
  date: '2024-01-20',
  location: {
    lat: 22.7196,
    lng: 75.8577,
    address: 'Test Address, Indore',
    area: 'Test Area'
  }
};

// Helper function to make API calls
async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    
    console.log(`\n${options.method || 'GET'} ${endpoint}`);
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    return { response: null, data: null, error };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n=== Testing Health Check ===');
  await makeRequest('/');
}

async function testCreateReport() {
  console.log('\n=== Testing Create Report ===');
  const result = await makeRequest('/reports', {
    method: 'POST',
    body: JSON.stringify(testReport)
  });
  
  if (result.data && result.data.success) {
    console.log('✅ Report created successfully!');
    console.log('Report ID:', result.data.report.reportId);
    return result.data.report;
  } else {
    console.log('❌ Failed to create report');
    return null;
  }
}

async function testGetReports() {
  console.log('\n=== Testing Get Reports ===');
  await makeRequest('/reports');
}

async function testGetMyReports() {
  console.log('\n=== Testing Get My Reports ===');
  await makeRequest('/reports/my-reports');
}

async function testGetReportById(reportId) {
  if (!reportId) return;
  
  console.log('\n=== Testing Get Report by ID ===');
  await makeRequest(`/reports/${reportId}`);
}

async function testUpdateReportStatus(reportId) {
  if (!reportId) return;
  
  console.log('\n=== Testing Update Report Status ===');
  await makeRequest(`/reports/${reportId}/status`, {
    method: 'PUT',
    body: JSON.stringify({
      status: 'Verified',
      notes: 'Test status update'
    })
  });
}

async function testAddNote(reportId) {
  if (!reportId) return;
  
  console.log('\n=== Testing Add Note ===');
  await makeRequest(`/reports/${reportId}/notes`, {
    method: 'POST',
    body: JSON.stringify({
      content: 'This is a test note added to the report.',
      isInternal: false
    })
  });
}

async function testGetStats() {
  console.log('\n=== Testing Get Statistics ===');
  await makeRequest('/reports/stats/overview');
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Report API Tests...\n');
  
  // Test health check
  await testHealthCheck();
  
  // Test create report
  const createdReport = await testCreateReport();
  
  // Test get all reports
  await testGetReports();
  
  // Test get my reports
  await testGetMyReports();
  
  // Test get specific report
  if (createdReport) {
    await testGetReportById(createdReport._id);
    
    // Test update status
    await testUpdateReportStatus(createdReport._id);
    
    // Test add note
    await testAddNote(createdReport._id);
    
    // Get updated report
    await testGetReportById(createdReport._id);
  }
  
  // Test statistics
  await testGetStats();
  
  console.log('\n✅ All tests completed!');
  console.log('\nNote: Some tests may fail if authentication is required.');
  console.log('To test with authentication, you need to:');
  console.log('1. Register/login to get a JWT token');
  console.log('2. Add the token to the Authorization header');
  console.log('3. Run the tests again');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}

export { runTests, makeRequest };
