//email imports
const hbs = require('nodemailer-express-handlebars')
const nodemailer = require('nodemailer')
const path = require('path')

//email engine
// initialize nodemailer
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'devteam@llamalist.com',
        pass: 'wpab bilj npwz lepk',
    },
})

// point to the template folder
const handlebarOptions = {
    viewEngine: {
        partialsDir: path.resolve('./email-engine/emails/'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./email-engine/emails/'),
}

exports.sendEmail = async (to, subject, context, template) => {
    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions))

    const mailOptions = {
        from: '"Llama List" <devteam@llamalist.com>', // sender address
        template, // the name of the template file, i.e., email.handlebars
        to: to.email,
        subject,
        context,
    }

    try {
        await transporter.sendMail(mailOptions)
    } catch (error) {
        console.log(`Nodemailer error sending email to ${to.email}`, error)
    }
}
