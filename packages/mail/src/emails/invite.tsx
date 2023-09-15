import * as reactEmailComponents from "@react-email/components";
import * as React from "react";

const {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} = reactEmailComponents;

export interface InviteProps {
  inviterUsername: string;
  teamName: string;
  link: string;
}

export const InviteUserEmail = ({
  inviterUsername = "user1",
  teamName = "Team",
  link = "https://example.com",
}: InviteProps) => {
  const previewText = `Join ${teamName} on Tableland Studio`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white font-sans">
          <Container className="mx-auto my-[40px] w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Section className="mt-[32px]">
              <Img
                src="data:image/svg+xml;charset=UTF-8,%3csvg className='h-6' viewBox='0 0 32 16' fill='none' xmlns='http://www.w3.org/2000/svg' %3e%3cpath fillRule='evenodd' clipRule='evenodd' d='M5.12366 4.56488C5.20594 4.16302 5.56357 3.85712 5.98533 3.85712H9.47261C9.93884 3.85712 10.1465 3.64743 10.4236 3.24051L11.9604 0.430052C12.1052 0.165416 12.3884 0 12.6969 0H25.5301C25.8606 0 26.1355 0.247737 26.162 0.567468C26.6782 6.79843 27.3326 11.022 31.4761 14.845C31.9108 15.2461 31.6328 16 31.0329 16H0.655819C0.0550865 16 -0.223428 15.2441 0.211887 14.8424C3.17796 12.1053 4.36631 9.11091 4.99402 5.23535C5.02545 5.04128 5.06395 4.85465 5.10259 4.66731C5.10962 4.63321 5.11666 4.59908 5.12366 4.56488Z' fill='black' /%3e%3c/svg%3e"
                width="40"
                height="37"
                alt="Vercel"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black">
              Join <strong>{teamName}</strong> on{" "}
              <strong>Tableland Studio</strong>
            </Heading>
            <Text className="text-[14px] leading-[24px] text-black">
              Hi there,
            </Text>
            <Text className="text-[14px] leading-[24px] text-black">
              User <strong>{inviterUsername}</strong> has invited you to the{" "}
              <strong>{teamName}</strong> team on{" "}
              <strong>Tableland Studio</strong>.
            </Text>
            <Section className="mb-[32px] mt-[32px] text-center">
              <Button
                pX={20}
                pY={12}
                className="rounded bg-[#000000] text-center text-[12px] font-semibold text-white no-underline"
                href={link}
              >
                Review Invitation
              </Button>
            </Section>
            <Text className="text-[14px] leading-[24px] text-black">
              or copy and paste this URL into your browser:{" "}
              <Link
                href={link}
                className="break-all text-blue-600 no-underline"
              >
                {link}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default InviteUserEmail;
