import sendMail from "../../emails";
import Welcome from "../../emails/Welcome";

export async function sendWelcome(to: string) {
  return await sendMail({
    to,
    subject: "Does this work?",
    component: <Welcome includeUnsubscribe={true} />,
  });
}
