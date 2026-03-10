import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import type { AuthPlugin } from "../types";

export const azurePlugin: AuthPlugin = {
  id: "azure",
  name: "Azure AD",
  getProvider: () => {
    if (!process.env.AZURE_AD_CLIENT_ID || !process.env.AZURE_AD_CLIENT_SECRET) {
      console.warn("Missing AZURE_AD_CLIENT_ID or AZURE_AD_CLIENT_SECRET. Azure AD auth provider disabled.");
      return null;
    }
    return MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      issuer: process.env.AZURE_AD_TENANT_ID
        ? `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`
        : undefined,
    });
  },
};
