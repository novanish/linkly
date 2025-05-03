import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { env } from '~/env/server';
import { APP_NAME } from '~/lib/consts';

interface Props {
  userFirstName?: string;
  verificationUrl: string;
  expiryTime: string;
  userEmail: string;
}

export function VerificationEmail({
  userFirstName = 'there',
  verificationUrl,
  expiryTime,
  userEmail,
}: Props) {
  const previewText = `Click the link below to sign in to ${APP_NAME}.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Row>
              <Column>
                <Img
                  src="https://i.ibb.co/Qp2kZJD/shortlink-logo.png"
                  width="140"
                  height="40"
                  alt={APP_NAME}
                  style={logo}
                />
              </Column>
            </Row>
          </Section>

          <Section style={content}>
            <Heading style={heading}>Sign in to {APP_NAME}</Heading>
            <Text style={paragraph}>Hi {userFirstName},</Text>
            <Text style={paragraph}>
              We received a request to sign in to {APP_NAME} using this email
              address. Click the button below to securely sign in to your
              account.
            </Text>

            <Button style={button} href={verificationUrl}>
              Sign in to {APP_NAME}
            </Button>

            <Text style={paragraph}>
              This link will expire in {expiryTime} and can only be used once.
            </Text>

            <Text style={paragraph}>
              If you didn't request this email, you can safely ignore it.
              Someone may have typed your email address by mistake.
            </Text>

            <Hr style={hr} />

            <Text style={securityNote}>
              <strong>Security tip:</strong> Always verify that emails claiming
              to be from {APP_NAME} are sent from an official {APP_NAME} domain.
              Our emails will always come from {env.RESEND_EMAIL_DOMAIN}.
            </Text>
          </Section>

          <Section style={verificationDetails}>
            <Text style={verificationDetailsText}>
              <strong>Verification Details:</strong>
              <br />
              Email: {userEmail}
              <br />
              Time: {new Date().toLocaleString()}
              <br />
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden',
  marginTop: '20px',
  marginBottom: '20px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
};

const header = {
  backgroundColor: '#ffffff',
  padding: '20px 30px',
  borderBottom: '1px solid #f0f0f0',
};

const logo = {
  height: '40px',
  width: 'auto',
};

const content = {
  padding: '30px',
};

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#333',
  margin: '0 0 20px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#444',
  margin: '0 0 20px',
};

const button = {
  backgroundColor: '#e11d48', // rose-600
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  maxWidth: '240px',
  margin: '30px auto',
  padding: '12px 20px',
};

const hr = {
  borderColor: '#f0f0f0',
  margin: '30px 0',
};

const securityNote = {
  fontSize: '14px',
  lineHeight: '1.5',
  color: '#666',
  backgroundColor: '#f9f9f9',
  padding: '15px',
  borderRadius: '6px',
  borderLeft: '4px solid #e11d48',
};

const verificationDetails = {
  padding: '0 30px 20px',
};

const verificationDetailsText = {
  fontSize: '13px',
  lineHeight: '1.5',
  color: '#666',
  backgroundColor: '#f9f9f9',
  padding: '15px',
  borderRadius: '6px',
};

const footer = {
  backgroundColor: '#f9f9f9',
  padding: '20px 30px',
  borderTop: '1px solid #f0f0f0',
};

const footerText = {
  fontSize: '13px',
  lineHeight: '1.5',
  color: '#666',
  margin: '0 0 10px',
  textAlign: 'center' as const,
};
