const nodemailer = require("nodemailer");
const { Config } = require("../../configs");
const { DEFAULT_EMAIL_TEMPLATE } = require("./templates");
const Logger = require("../../Logger");

module.exports = class Mail {
  static transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: Config.SERVER_EMAIL,
      pass: Config.SERVER_EMAIL_PASSWORD,
    },
  });

  static async sendEmail({ subject, to, message }, templates = {}) {
    Logger.info("Sending email");
    try {
      const options = {
        from: `TUK Social <${Config.SERVER_EMAIL}>`, // sender address
        to: to, // receiver email
        subject: subject,
        text: templates.string || message,
        html: templates.HTML || DEFAULT_EMAIL_TEMPLATE(message),
      };

      const info = await Mail.transporter.sendMail(options);
    } catch (error) {
      Logger.error({
        message: `Error sending email for ${subject} to ${to} `,
        error: error,
      });
      console.log("error sending email: ", error);
    }
  }
};
