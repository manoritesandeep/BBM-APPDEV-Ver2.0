import { useContext } from "react";
import { EmailService } from "../EmailService";
import { EmailTemplates } from "../EmailTemplates";
import { AuthContext } from "../../../store/auth-context";

/**
 * Custom hook for handling user-related emails
 * Manages welcome emails, password resets, and other user communications
 */
export const useUserEmails = () => {
  const authCtx = useContext(AuthContext);

  const sendWelcomeEmail = async (userEmail, userName) => {
    try {
      const emailData = {
        to: [userEmail],
        message: {
          subject: `Welcome to Build Bharat Mart, ${userName}! 🎉`,
          html: EmailTemplates.welcomeTemplate(userName),
          text: `Welcome ${userName}! Welcome to Build Bharat Mart - Building Your Dreams, One Tool at a Time! We're excited to have you join our community of builders, contractors, and DIY enthusiasts.`,
        },
        template: {
          type: "welcome",
          version: "1.0",
        },
        metadata: {
          userId: authCtx.userId,
          emailType: "welcome",
          userName,
        },
      };

      const result = await EmailService.sendEmail(emailData);

      if (result.success) {
        console.log(`✅ Welcome email sent to ${userName} (${userEmail})`);
      } else {
        console.error(`❌ Failed to send welcome email: ${result.error}`);
      }

      return result;
    } catch (error) {
      console.error("❌ Welcome email error:", error);
      return { success: false, error: error.message };
    }
  };

  const sendPasswordResetEmail = async (userEmail, userName, resetLink) => {
    try {
      const emailData = {
        to: [userEmail],
        message: {
          subject: "Reset Your Build Bharat Mart Password",
          html: EmailTemplates.passwordResetTemplate(userName, resetLink),
          text: `Hi ${userName}, we received a request to reset your password for your Build Bharat Mart account. Click here to reset: ${resetLink}`,
        },
        template: {
          type: "password_reset",
          version: "1.0",
        },
        metadata: {
          userId: authCtx.userId,
          emailType: "password_reset",
          userName,
        },
      };

      const result = await EmailService.sendEmail(emailData);

      if (result.success) {
        console.log(
          `✅ Password reset email sent to ${userName} (${userEmail})`
        );
      }

      return result;
    } catch (error) {
      console.error("❌ Password reset email error:", error);
      return { success: false, error: error.message };
    }
  };

  const sendAccountVerificationEmail = async (
    userEmail,
    userName,
    verificationLink
  ) => {
    try {
      const emailData = {
        to: [userEmail],
        message: {
          subject: "Verify Your Build Bharat Mart Account",
          html: EmailTemplates.generateBaseTemplate(`
            <h2>Verify Your Account ✅</h2>
            <p>Hi ${userName},</p>
            <p>Please verify your email address to complete your Build Bharat Mart account setup.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" class="button">Verify Email</a>
            </div>
            <p>This link will expire in 24 hours.</p>
          `),
          text: `Hi ${userName}, please verify your email address: ${verificationLink}`,
        },
        template: {
          type: "email_verification",
          version: "1.0",
        },
        metadata: {
          userId: authCtx.userId,
          emailType: "email_verification",
          userName,
        },
      };

      return await EmailService.sendEmail(emailData);
    } catch (error) {
      console.error("❌ Account verification email error:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendAccountVerificationEmail,
  };
};
