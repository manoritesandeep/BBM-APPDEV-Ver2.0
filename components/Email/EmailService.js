import { collection, addDoc } from "@react-native-firebase/firestore";
import { getFirebaseDB } from "../../util/firebaseConfig";

/**
 * Core email service for sending emails via Firebase extension
 * Handles all email sending logic with proper error handling and logging
 */
export class EmailService {
  static async sendEmail(emailData) {
    try {
      const db = await getFirebaseDB();
      if (!db) {
        throw new Error("Firebase DB not initialized");
      }

      // Validate required fields
      if (!emailData.to || !emailData.to.length) {
        throw new Error("Email recipient(s) required");
      }

      if (!emailData.message?.subject || !emailData.message?.html) {
        throw new Error("Email subject and HTML content required");
      }

      // Add document to mail collection for Firebase extension processing
      const emailDocument = {
        to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
        cc: emailData.cc || [],
        bcc: emailData.bcc || [],
        message: {
          subject: emailData.message.subject,
          text: emailData.message.text || "",
          html: emailData.message.html,
          attachments: emailData.message.attachments || [],
        },
        metadata: {
          ...emailData.metadata,
          sentAt: new Date().toISOString(),
          source: "BBM-App",
        },
      };

      // Add template field if provided (for company records)
      // Note: Use template.name for Firebase extension compatibility
      if (emailData.template) {
        emailDocument.template = {
          name: emailData.template.type || emailData.template.name || "default",
          data: emailData.template.data || {},
        };
      }

      const docRef = await addDoc(collection(db, "mail"), emailDocument);

      console.log(`✅ Email enqueued successfully. Doc ID: ${docRef.id}`);
      return { success: true, docId: docRef.id };
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  static async sendBulkEmails(emailsData) {
    const results = [];

    for (const emailData of emailsData) {
      const result = await this.sendEmail(emailData);
      results.push(result);

      // Add small delay to prevent overwhelming Firebase
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }
}
