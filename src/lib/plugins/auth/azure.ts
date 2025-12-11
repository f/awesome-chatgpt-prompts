import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import type { AuthPlugin } from "../types";

export const azurePlugin: AuthPlugin = {
  id: "azure",
  name: "Azure AD",
  getProvider: () =>
    MicrosoftEntraID({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      issuer: process.env.AZURE_AD_TENANT_ID 
        ? `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/v2.0`
        : undefined,
    }),
};
