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
      },
      max_memory_restart: "1G"
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
      },
      max_memory_restart: "1G",
      kill_timeout: 3000,
      wait_ready: true
    }
  ]
} 