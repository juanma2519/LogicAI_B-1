
const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path');

const sendEmail = async (nombre, email, subject, text, template) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      service: 'gmail',
      port: 587,
      tls: {
        rejectUnauthorized: false
      },
      secure: true,
      auth: {
        user: "razor.juanma@gmail.com",
        pass: "xcvtnbybrsbuwzyv",
      },
    });

    const handlebarOptions = {
      viewEngine: {
          partialsDir: path.resolve('./views/'),
          defaultLayout: false,
      },
      viewPath: path.resolve('./views/'),
    };
    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions));
    

    await transporter.sendMail({
      from: 'WeSolai.com <razor.juanma@gmail.com>',
      to: email,
      subject: subject,
      template: template, // the name of the template file i.e email.handlebars
      context:{
          name: nombre, // replace {{name}} with Adebola
          url: text // replace {{company}} with My Company
      }
    });
    return "Correo Electrónico enviado correctamente";
  } catch (error) {
    return "Correo Electrónico no enviado: " + error;
  }
};

module.exports = sendEmail;