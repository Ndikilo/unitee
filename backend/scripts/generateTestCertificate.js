const mongoose = require('mongoose');
const Certificate = require('../src/models/Certificate');
const User = require('../src/models/User');
require('dotenv').config();

const generateTestCertificate = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/volunteer-platform');
    console.log('✅ MongoDB Connected');

    // Find a user (or use the first user)
    const user = await User.findOne({ role: 'user' });
    
    if (!user) {
      console.log('❌ No volunteer user found. Please create a volunteer account first.');
      process.exit(1);
    }

    console.log(`\n📋 Creating certificate for: ${user.name} (${user.email})`);

    // Create a beautiful test certificate
    const certificateData = {
      type: 'volunteer_completion',
      title: 'Outstanding Community Service Excellence',
      description: 'For exceptional dedication and outstanding contribution to community development through volunteer service',
      recipientId: user._id,
      recipientName: user.name,
      recipientEmail: user.email,
      issuerId: user._id, // Using same user as issuer for test
      issuerName: 'UNITEE Platform Administrator',
      issuerType: 'admin',
      opportunityTitle: 'Community Clean-Up Initiative 2024',
      hoursCompleted: 25,
      skillsAcquired: ['Leadership', 'Team Coordination', 'Environmental Awareness', 'Community Engagement'],
      achievementLevel: 'gold',
      metadata: {
        location: 'Yaoundé, Cameroon',
        category: 'Environment',
        tags: ['community', 'environment', 'leadership']
      }
    };

    // Generate certificate
    const certificate = await Certificate.generateCertificate(certificateData);

    console.log('\n✅ Certificate Generated Successfully!');
    console.log('\n📄 Certificate Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Certificate ID: ${certificate.certificateId}`);
    console.log(`Type: ${certificate.type}`);
    console.log(`Title: ${certificate.title}`);
    console.log(`Recipient: ${certificate.recipientName}`);
    console.log(`Hours: ${certificate.hoursCompleted}`);
    console.log(`Achievement Level: ${certificate.achievementLevel.toUpperCase()}`);
    console.log(`Skills: ${certificate.skillsAcquired.join(', ')}`);
    console.log(`Verification URL: ${certificate.verificationUrl}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n📥 To download the certificate:');
    console.log(`1. Login to the platform as: ${user.email}`);
    console.log(`2. Go to Dashboard → Certificates tab`);
    console.log(`3. Click "Download PDF" button`);
    console.log('\nOR');
    console.log(`\n🔗 Use this API endpoint (with authentication token):`);
    console.log(`GET http://localhost:5000/api/certificates/download/${certificate.certificateId}`);
    
    console.log('\n✨ You can also verify the certificate at:');
    console.log(`http://localhost:8082/verify/${certificate.certificateId}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

generateTestCertificate();
