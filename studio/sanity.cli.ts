import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || "uzbgef9r",
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
  studioHost: process.env.SANITY_STUDIO_HOST || "rituel",
});
