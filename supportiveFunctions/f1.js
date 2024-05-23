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
      html: `<p>Your verification Link is: <a href="http://13.232.84.203:8800/api/vereifying/seller/${verificationCode}">Click Here To Verify Your Account!</a></p>`,
    };

    await transporter.sendMail(mailOptions);

    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Error sending verification email");
  }
};
const sendForgetedPassword = async (email, verificationCode) => {
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
      subject: "Unique Bajar Password Forgot!",
      html: `
      <style>
        .cards-list {
          z-index: 0;
          width: 100%;
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
        }
        .card {
          margin: 30px auto;
          height: 300px;
          border-radius: 40px;
          box-shadow: 5px 5px 30px 7px rgba(0,0,0,0.25), -5px -5px 30px 7px rgba(0,0,0,0.22);
          cursor: pointer;
          transition: 0.4s;
        }

        .card .card_image {
          width: inherit;
          height: inherit;
          border-radius: 40px;
        }

        .card .card_image img {
          width: inherit;
          height: inherit;
          border-radius: 40px;
          object-fit: cover;
        }

        .card .card_title {
          text-align: center;
          border-radius: 0px 0px 40px 40px;
          font-family: sans-serif;
          font-weight: bold;
          font-size: 30px;
          margin-top: -80px;
          height: 40px;
        }

        .card:hover {
          transform: scale(0.9, 0.9);
          box-shadow: 5px 5px 30px 15px rgba(0,0,0,0.25), -5px -5px 30px 15px rgba(0,0,0,0.22);
        }

        .title-white {
          color: white;
        }

        .title-black {
          color: black;
        }

        @media all and (max-width: 500px) {
          .card-list {
            /* On small screens, we are no longer using row direction but column */
            flex-direction: column;
          }
        }
      </style>
      <div class="cards-list">
        <div class="card 4">
          <div class="card_image">
            <img src="https://media.giphy.com/media/LwIyvaNcnzsD6/giphy.gif" />
          </div>
          <div class="card_title title-black">
            <p>You Forgot Your Password!</p>
            <p>Password: ${verificationCode} </p>
          </div>
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Error sending verification email");
  }
};

const isValidGmail = (gmail) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return emailRegex.test(gmail);
};

module.exports = {
  sendVerificationEmail,
  isValidGmail,
  sendForgetedPassword,
};
