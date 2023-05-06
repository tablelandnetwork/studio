import { MjmlColumn, MjmlSection, MjmlSpacer, MjmlWrapper } from "mjml-react";
import BaseLayout from "./components/BaseLayout";
import Button from "./components/Button";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Heading from "./components/Heading";
import Text from "./components/Text";
import { colors, fontFamily, fontSize, screens, spacing } from "./theme";

const inviteStyle = `
  .h1 > * {
    font-size: 56px !important;
  }
  .h2 > * {
    font-size: ${fontSize.lg}px !important;
  }
  .p > * {
    font-size: ${fontSize.base}px !important;
  }

  @media (min-width:${screens.xs}) {
    .h1 > * {
      font-size: 84px !important;
    }
    .h2 > * {
      font-size: ${fontSize.xxl}px !important;
    }
    .p > * {
      font-size: ${fontSize.md}px !important;
    }
  }
`;

type InviteProps = {
  includeUnsubscribe?: boolean;
  inviterUsername: string;
  teamName: string;
  link: string;
};

const Invite = ({
  includeUnsubscribe,
  inviterUsername: inviteUsername,
  teamName,
  link,
}: InviteProps) => {
  return (
    <BaseLayout width={600} style={inviteStyle}>
      <Header />
      <MjmlWrapper backgroundColor={colors.black}>
        <MjmlSection paddingBottom={spacing.s11} cssClass="gutter">
          <MjmlColumn>
            <Heading maxWidth={420} cssClass="h1" fontFamily={fontFamily.serif}>
              You&apos;ve been invited to Tableland Studio.
            </Heading>
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection paddingBottom={spacing.s11} cssClass="gutter">
          <MjmlColumn>
            <Heading cssClass="h2" paddingBottom={spacing.s6}>
              <span style={{ color: colors.green300 }}>{inviteUsername}</span>{" "}
              invited you to join the team{" "}
              <span style={{ color: colors.green300 }}>{teamName}</span> on
              Tableland Studio.
            </Heading>
            <Text
              cssClass="p"
              fontSize={fontSize.md}
              paddingBottom={spacing.s7}
            >
              Click the button below to visit Tableland Studio to review and
              accept or ignore your inviation.
            </Text>

            <MjmlSpacer height={spacing.s3} cssClass="lg-hidden" />
            <Button
              href={link}
              backgroundColor={colors.green300}
              align="right"
              cssClass="lg-hidden"
            >
              Review Invitation
            </Button>
          </MjmlColumn>
        </MjmlSection>
      </MjmlWrapper>
      <Footer includeUnsubscribe={includeUnsubscribe} />
    </BaseLayout>
  );
};
Invite.subject = "You've been invited to a team on Tableland Studio";
export default Invite;
