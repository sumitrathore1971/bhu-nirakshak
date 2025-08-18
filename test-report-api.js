// Test script to verify report API is returning media files

const API_BASE_URL = 'http://localhost:8080/api';

async function testReportAPI() {
  console.log('=== Testing Report API ===');
  
  try {
    // Test 1: Check if server is running
    console.log('\n1. Testing server connection...');
    const healthResponse = await fetch('http://localhost:8080/');
    if (healthResponse.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server is not responding');
      return;
    }

    // Test 2: Get all reports (this would require admin token, but let's try)
    console.log('\n2. Testing reports endpoint...');
    const reportsResponse = await fetch(`${API_BASE_URL}/reports`);
    console.log('Reports endpoint status:', reportsResponse.status);
    
    if (reportsResponse.ok) {
      const reportsData = await reportsResponse.json();
      console.log('✅ Reports endpoint accessible');
      console.log('Total reports:', reportsData.data?.reports?.length || 0);
      
      // Check for reports with media
      const reportsWithMedia = reportsData.data?.reports?.filter(report => 
        report.media && report.media.length > 0
      ) || [];
      
      console.log('Reports with media:', reportsWithMedia.length);
      
      if (reportsWithMedia.length > 0) {
        console.log('\nReports with media files:');
        reportsWithMedia.forEach((report, index) => {
          console.log(`\n${index + 1}. Report ID: ${report.reportId}`);
          console.log(`   Title: ${report.title}`);
          console.log(`   Media files: ${report.media.length}`);
          report.media.forEach((media, mediaIndex) => {
            console.log(`     ${mediaIndex + 1}. ${media.originalName}`);
            console.log(`        URL: ${media.url}`);
            console.log(`        MIME Type: ${media.mimeType}`);
          });
        });
      }
    } else {
      console.log('❌ Reports endpoint not accessible (might need authentication)');
    }

    // Test 3: Test image URLs directly
    console.log('\n3. Testing image URLs...');
    const testImages = [
      'http://localhost:8080/uploads/media-1755420669900-406114114.jpg',
      'http://localhost:8080/uploads/media-1755421027839-471029192.jpg'
    ];
    
    for (const imageUrl of testImages) {
      try {
        const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
        if (imageResponse.ok) {
          console.log(`✅ ${imageUrl} - Accessible`);
        } else {
          console.log(`❌ ${imageUrl} - Not accessible (${imageResponse.status})`);
        }
      } catch (error) {
        console.log(`❌ ${imageUrl} - Error: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testReportAPI();
