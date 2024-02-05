const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, verificationCode) => {
  try {
    // Configure nodemailer with your email service provider settings
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "satyampandit021@gmail.com", // replace with your email
        pass: "mnlm kfcp wzwb dthw", // replace with your email password
      },
    });
    // Send verification email
    const mailOptions = {
      from: "satyampandit021@gmail.com", // replace with your email
      to: email,
      subject: "Account Verification",
      html: `<p>Your verification Link is: <a href="http://localhost:8800/api/vereifying/seller/${verificationCode}">Click Here To Verify Your Account!</a></p>`,
    };

    await transporter.sendMail(mailOptions);

    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Error sending verification email");
  }
};

module.exports = {
  sendVerificationEmail,
};
