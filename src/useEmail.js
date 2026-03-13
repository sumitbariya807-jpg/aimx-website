import { emailConfig } from "./emailConfig.js";
import emailjs from "@emailjs/browser";

let emailJSInit = false;

export const initEmailJS = () => {
  if (!emailJSInit && emailConfig.publicKey) {
    emailjs.init(emailConfig.publicKey);
    emailJSInit = true;
  }
};

export const sendConfirmationEmail = async (registrationData) => {
  try {
    initEmailJS();

    if (!emailConfig.isEmailConfigured()) {
      console.warn("EmailJS not configured");
      return false;
    }

    // USER EMAIL
    const userParams = {
      to_email: registrationData.email,
      participant_name: registrationData.name,
      participant_id: registrationData.participantId,
      event_name: `${registrationData.eventName} - ${registrationData.eventSubname}`,
      college: registrationData.college,
      amount: registrationData.amount,
      transaction_id: registrationData.transactionId,
      message_type: "user_confirmation",
    };

    await emailjs.send(
      emailConfig.serviceId,
      emailConfig.templateId,
      userParams,
      emailConfig.publicKey
    );

    // ADMIN EMAIL
    const adminParams = {
      to_email: emailConfig.adminEmail,
      participant_name: registrationData.name,
      participant_id: registrationData.participantId,
      event_name: `${registrationData.eventName} - ${registrationData.eventSubname}`,
      college: registrationData.college,
      amount: registrationData.amount,
      transaction_id: registrationData.transactionId,
      message_type: "admin_notification",
    };

    await emailjs.send(
      emailConfig.serviceId,
      emailConfig.templateId,
      adminParams,
      emailConfig.publicKey
    );

    console.log("✅ User + Admin email sent");
    return true;

  } catch (error) {
    console.error("❌ Email send failed:", error);
    return false;
  }
};

export const sendStatusUpdateEmail = async (registrationData, newStatus) => {
  try {
    initEmailJS();

    const statusMessages = {
      approved: "✅ Your registration has been ACCEPTED by admin.",
      rejected: "❌ Your registration was rejected. Please re-register.",
      pending: "⏳ Your registration is still under review."
    };

    const params = {
      to_email: registrationData.email,
      participant_name: registrationData.name,
      participant_id: registrationData.participantId,
      event_name: `${registrationData.eventName} - ${registrationData.eventSubname}`,
      new_status: newStatus.toUpperCase(),
      status_message: statusMessages[newStatus],
      message_type: "status_update"
    };

    await emailjs.send(
      emailConfig.serviceId,
      emailConfig.templateId,
      params,
      emailConfig.publicKey
    );

    console.log("✅ Status email sent");
    return true;

  } catch (error) {
    console.error("❌ Status email failed:", error);
    return false;
  }
};