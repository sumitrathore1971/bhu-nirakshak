// Script to check reports with media files
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bhunirakshak";

async function checkReports() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Import the Report model
    const Report = mongoose.model('Report', new mongoose.Schema({}, { strict: false }));

    // Get all reports
    const reports = await Report.find({});
    console.log(`\nTotal reports found: ${reports.length}`);

    // Check reports with media
    const reportsWithMedia = reports.filter(report => report.media && report.media.length > 0);
    console.log(`Reports with media: ${reportsWithMedia.length}`);

    if (reportsWithMedia.length > 0) {
      console.log('\nReports with media files:');
      reportsWithMedia.forEach((report, index) => {
        console.log(`\n${index + 1}. Report ID: ${report.reportId}`);
        console.log(`   Title: ${report.title}`);
        console.log(`   Media files: ${report.media.length}`);
        report.media.forEach((media, mediaIndex) => {
          console.log(`     ${mediaIndex + 1}. ${media.originalName} (${media.filename})`);
          console.log(`        URL: ${media.url}`);
          console.log(`        MIME Type: ${media.mimeType}`);
        });
      });
    } else {
      console.log('\nNo reports with media files found.');
      console.log('\nTo test image display:');
      console.log('1. Submit a new report with image files');
      console.log('2. Or manually add media to an existing report');
    }

    // Show all reports
    console.log('\nAll reports:');
    reports.forEach((report, index) => {
      console.log(`${index + 1}. ${report.reportId} - ${report.title} - ${report.status}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkReports();
