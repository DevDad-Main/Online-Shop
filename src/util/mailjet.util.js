import dotenv from "dotenv";
import Mailjet from "node-mailjet";

dotenv.config();

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY,
);

export default function sendEmail({
  toEmail,
  toName,
  subject,
  text,
  html,
  fromEmail = "onlineshopdummy@gmail.com",
  fromName = "DevDads Shop",
}) {
  return mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: fromEmail,
          Name: fromName,
        },
        To: [
          {
            Email: toEmail,
            Name: toName,
          },
        ],
        Subject: subject,
        TextPart: text,
        HTMLPart: html,
      },
    ],
  });
}
