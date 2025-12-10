import AzureAD from "next-auth/providers/azure-ad";
import type { AuthPlugin } from "../types";

export const azurePlugin: AuthPlugin = {
  id: "azure",
  name: "Azure AD",
  getProvider: () =>
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
};
