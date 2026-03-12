export const emailConfig = {
  serviceId: "service_gebhdnk",
  templateId: "template_aimx2026",
  publicKey: "A86Bo40MkJ1yIDuxH",
  adminEmail: "infoaimx2026@gmail.com",

  isEmailConfigured() {
    return this.serviceId && this.templateId && this.publicKey;
  }
};