import * as reactEmailComponents from "@react-email/components";
import { getBaseUrl } from "@tableland/studio-client";
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

const baseUrl = getBaseUrl();

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
                src={`${baseUrl}/mesa.jpg`}
                width="55"
                height="31"
                alt="Tableland Studio"
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
