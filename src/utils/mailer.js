const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Standard service, can be changed based on env
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendMail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    };
    
    // Attempt to send email. If it fails (e.g., credentials missing), we catch and log it so the app doesn't crash.
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}. Error:`, error.message);
    console.log(`[DEV MODE] Captured Email Output: \nSubject: ${subject}\nText: ${text}`);
  }
};
