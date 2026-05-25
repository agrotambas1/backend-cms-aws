// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// const creatorId = "92f62e79-f492-4c34-9026-bf499c4a08c5";

// const media = [
//   {
//     id: "550e8400-e29b-41d4-a716-446655440000",
//     fileName: "example-image.jpg",
//     filePath: "/uploads/example-image.jpg",
//     mimeType: "image/jpeg",
//     fileSize: 204800,
//     url: "http://localhost:3000/uploads/example-image.jpg",
//     altText: "Example image",
//     caption: "This is an example image",
//     createdBy: creatorId,
//     createdAt: new Date(),
//     deletedAt: null,
//   },
// ];

// const main = async () => {
//   console.log("Seeding media data...");

//   for (const item of media) {
//     await prisma.media.create({
//       data: item,
//     });
//     console.log(`Inserted media: ${item.fileName}`);
//   }

//   console.log("Seeding completed.");
// };

// main()
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const users = [
  {
    id: "92f62e79-f492-4c34-9026-bf499c4a08c5",
    name: "Super Administrator",
    username: "superadmin",
    email: "superadmin@example.com",
    password: bcrypt.hashSync("superadmin", 10),
    role: "SUPER_ADMIN",
    isActive: true,
    createdAt: new Date(),
    deletedAt: null,
  },
  {
    id: "92f62e79-f492-4c34-9026-bf499c4a08c6",
    name: "Admin",
    username: "admin",
    email: "admin@example.com",
    password: bcrypt.hashSync("admin", 10),
    role: "ADMIN",
    isActive: true,
    createdAt: new Date(),
    deletedAt: null,
  },
];

const main = async () => {
  console.log("Seeding user data...");

  for (const user of users) {
    await prisma.user.create({
      data: user,
    });

    console.log(`Inserted user: ${user.username}`);
  }

  console.log("Seeding completed.");
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
