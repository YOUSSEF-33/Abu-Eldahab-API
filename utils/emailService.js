import nodemailer from 'nodemailer';

// Create a transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'yatef842@gmail.com', // Replace with your Gmail address
        pass: 'mtux njlz ombq tvqh', // Replace with your Gmail password or app-specific password
    },
});

// Function to send a verification email with a code
export const sendVerificationEmail = async (email, verificationCode) => {
    const mailOptions = {
        from: 'yatef57@gmail.com',
        to: email,
        subject: 'Verify Your Email Address',
        html: `
      <p>Thank you for signing up! Your verification code is:</p>
      <h2>${verificationCode}</h2>
      <p>This code will expire in 10 minutes.</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};