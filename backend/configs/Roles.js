const Permissions = require("./Permissions");

module.exports = [
  {
    label: "Student",
    name: "student",
    permissions: [],
    level: 100,
    description: "Student User",
  },
  {
    label: "Staff",
    name: "staff",
    permissions: [],
    level: 90,
    description: "Staff User",
  },
  {
    label: "Student Leader",
    name: "student_leader",
    permissions: [Permissions.CHANGE_CLASS_GROUP_ADMINS.name],
    level: 80,
    description: "SATUK Member",
  },
  {
    label: "Director",
    name: "director",
    permissions: [
      Permissions.CHANGE_CLASS_GROUP_ADMINS.name,
      Permissions.VERIFY_STUDENT_LEADER.name,
    ],
    level: 50,
    description: "School Director",
  },
  {
    label: "Dean",
    name: "dean",
    permissions: [
      Permissions.CHANGE_CLASS_GROUP_ADMINS.name,
      Permissions.VERIFY_STUDENT_LEADER.name,
      Permissions.VERIFY_DIRECTORS.name,
    ],
    level: 30,
    description: "Faculty Dean",
  },
  {
    label: "Administrator",
    name: "admin",
    permissions: Object.keys(Permissions),
    level: 1,
    description: "Administrator",
  },
];
