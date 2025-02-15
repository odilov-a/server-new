module.exports = {
  apps: [
    {
      name: "api-server",
      script: "./dist/server.bundle.js",
    },
    {
      name: "cdn-server",
      script: "./dist/cdn.bundle.js",
    },
  ],
};
