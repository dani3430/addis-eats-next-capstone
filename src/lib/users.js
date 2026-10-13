import bcrypt from "bcryptjs";

// In-memory, seeded demo accounts. A real app would look these up in a database.
const users = [
  {
    id: "usr_almaz",
    name: "Almaz Bekele",
    phone: "0912345678",
    passwordHash: bcrypt.hashSync("password123", 10),
    role: "customer",
  },
  {
    id: "usr_biruk",
    name: "Biruk Tesfaye",
    phone: "0922334455",
    passwordHash: bcrypt.hashSync("password123", 10),
    role: "customer",
  },
  {
    id: "usr_staff",
    name: "Kitchen Staff",
    phone: "0900000000",
    passwordHash: bcrypt.hashSync("staffpass", 10),
    role: "staff",
  },
];

export function findUserByPhone(phone) {
  return users.find((user) => user.phone === phone) ?? null;
}

export function verifyPassword(user, password) {
  return bcrypt.compareSync(password, user.passwordHash);
}

export function publicUser(user) {
  const { id, name, role } = user;
  return { id, name, role };
}