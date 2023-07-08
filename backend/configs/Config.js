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
};
