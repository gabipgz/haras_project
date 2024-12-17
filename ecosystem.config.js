module.exports = {
  apps: [
    {
      name: "haras-backend",
      cwd: "./backend",
      script: "npm",
      args: "run start:prod:external",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        EXTERNAL_HOST: "true"
      }
    },
    {
      name: "haras-frontend",
      cwd: "./frontend",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_PUBLIC_API_URL: "http://34.56.65.192:3001"
      }
    }
  ]
} 