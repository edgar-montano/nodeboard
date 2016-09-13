
//used to configure mongodb
exports.mongoURL = "mongodb://localhost/nodeboard";


//used for nodemailer 
exports.smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'username@example.com',
        pass: ''
    }
};
