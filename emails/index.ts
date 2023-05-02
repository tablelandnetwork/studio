import { buildSendMail } from "mailing-core";
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "smtp.postmarkapp.com",
  port: 2525,
  auth: {
    user: process.env.POSTMARK_API_KEY,
    pass: process.env.POSTMARK_API_KEY,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

const sendMail = buildSendMail({
  transport,
  defaultFrom: "ops@textile.io",
  configPath: "./mailing.config.json",
});

export default sendMail;
