export default {
  providers: [
    {
      // Convex Auth issues tokens from this deployment.
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
