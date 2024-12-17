module.exports = {
  apps: [{
    name: "haras-backend",
    script: "npm",
    args: "run start:prod:external",
    watch: false,
    autorestart: true,
    restart_delay: 1000,
    env: {
      NODE_ENV: "production",
      EXTERNAL_HOST: "true"
    }
  }]
} 