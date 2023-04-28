import { socialLoginAtom } from "@/store/login";
import { useAtom } from "jotai";

export default function SocialLogin() {
  const [socialLogin] = useAtom(socialLoginAtom);
  return (
    <div>
      <p>Social login client id: {socialLogin.clientId}</p>
    </div>
  );
}
