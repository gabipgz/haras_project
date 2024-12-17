module.exports = {
  apps: [{
    name: "haras-frontend",
    script: "npm",
    args: "start",
    watch: false,
    autorestart: true,
    restart_delay: 1000,
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
} 