const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport(sendgridTransport({
        auth: {
            api_key: process.env.MAIL_KEY
        }
    }));
    try {
        const info = await transporter.sendMail({
            to: `${to}`,
            from: `${process.env.EMAIL_FROM}`,
            subject: `${subject}`,
            html: `${html}`
        });
        return info; // { message: "success" }
    } catch (err) {
        console.log(err);
        throw new Error(`Error: ${err.message}`);
    }
}

module.exports = sendEmail;