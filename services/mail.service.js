const nodemailer = require('nodemailer');

const sendMail = async (mailOptions) => {
    console.log(mailOptions);
    // Create a transporter using the default SMTP transport
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        // secure: false,
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: 'eejvpvlgkpdxhqwj' //process.env.EMAIL_PASSWORD
        },
        // tls: {
        //     rejectUnauthorized: false
        // }
    });
    
    const response = await transporter.sendMail(mailOptions);
    console.log(response);
    return response;
}

module.exports = { sendMail };

