import dotenv from 'dotenv';
dotenv.config()
import nodemailer from 'nodemailer';

const sendEmail = async (subject, message, send_to, send_from, reply_to) => {

  const transporter = nodemailer.createTransport({

    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {

        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    tls: {

        rejectUnauthorized: false
    }
  })

  const options = {

    from: send_from,
    to: send_to,
    reply_to: reply_to,
    subject: subject,
    html: message
  }

  //send the email
  transporter.sendMail(options, function (err, info) {

    if(err) {

        console.log(err);

    }else {

    console.log(info);
    }

    
  })
}

export default sendEmail;