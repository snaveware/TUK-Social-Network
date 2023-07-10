const Persmissions = require("./Permissions");
const Roles = require("./Roles");

const RootAdmin = {
  firstName: "Root",
  lastName: "Admin",
  email: process.env.SERVER_EMAIL,
  status: "active",
  roleName: "admin",
};

module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  INIT_DB: Number(process.env.INIT_DB),
  PORT: process.env.PORT,
  ADMIN: RootAdmin,
  SERVER_EMAIL: process.env.SERVER_EMAIL,
  SERVER_EMAIL_PASSWORD: process.env.SERVER_EMAIL_PASSWORD,
  VERIFICATION_TOKEN_LIFETIME: 600000,
  SECRET: process.env.SECRET,
  ACCESS_TOKEN_LIFETIME: 3600,
  REFRESH_TOKEN_LIFETIME: 86400,
};
