const nodemailer = require('nodemailer');

envConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || 'vipinkarthik.mb2023ece@sece.ac.in',
    pass: process.env.EMAIL_PASS || 'seceece@2023',
  },
};

const transporter = nodemailer.createTransport(envConfig);

const sendWelcomeEmail = async (email) => {
  try {
    const mailOptions = {
      from: `Language Learn <${envConfig.auth.user}>`,
      to: email,
      subject: 'Welcome to Language Learn Platform!',
      text: `Welcome to Language Learn Platform!

Thank you for joining our community of passionate language learners. We are excited to have you on board.

Here's how you can get started:
1. Explore our diverse range of courses tailored to all skill levels.
2. Practice with interactive lessons and quizzes.
3. Join live sessions with our expert tutors.

Ready to start your journey? Visit your dashboard now and dive in!

Need help or have questions? Reach out to our support team anytime.

Happy learning!
The Language Learn Platform Team`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #4CAF50;">Welcome to Language Learn Platform!</h1>
          <p>Thank you for joining our community of passionate language learners. We are thrilled to have you on board.</p>
          <h2>Get Started Today:</h2>
          <ul>
            <li>🌍 Explore our diverse range of courses tailored to all skill levels.</li>
            <li>🎯 Practice with interactive lessons and quizzes.</li>
            <li>👩‍🏫 Join live sessions with expert tutors.</li>
          </ul>
          <p>Ready to start your journey? <a href="https://languagelearnplatform.com/dashboard" style="color: #4CAF50; text-decoration: none;">Visit your dashboard</a> now and dive in!</p>
          <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">
          <p>If you have any questions or need assistance, feel free to <a href="https://languagelearnplatform.com/support" style="color: #4CAF50; text-decoration: none;">contact our support team</a>.</p>
          <p style="margin-top: 20px;">Happy learning!<br>The <strong>Language Learn Platform</strong> Team</p>
          <footer style="font-size: 12px; color: #888; margin-top: 20px;">
            <p>You are receiving this email because you signed up on our platform. If this was not you, please contact us immediately.</p>
            <p>&copy; 2025 Language Learn Platform. All rights reserved.</p>
          </footer>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};

module.exports = { sendWelcomeEmail };