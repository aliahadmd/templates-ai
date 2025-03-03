import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

// Default permissions
const DEFAULT_PERMISSIONS = [
  { name: 'user:read', description: 'Read user information' },
  { name: 'user:write', description: 'Create or update user information' },
  { name: 'user:delete', description: 'Delete users' },
  { name: 'role:read', description: 'Read role information' },
  { name: 'role:write', description: 'Create or update roles' },
  { name: 'role:delete', description: 'Delete roles' },
  { name: 'permission:read', description: 'Read permission information' },
  { name: 'permission:write', description: 'Create or update permissions' },
  { name: 'permission:delete', description: 'Delete permissions' }
];

// Default roles with their permissions
const DEFAULT_ROLES = [
  {
    name: 'admin',
    description: 'Administrator with full access',
    permissions: [
      'user:read',
      'user:write',
      'user:delete',
      'role:read',
      'role:write',
      'role:delete',
      'permission:read',
      'permission:write',
      'permission:delete'
    ]
  },
  {
    name: 'user',
    description: 'Regular user with limited access',
    permissions: ['user:read']
  }
];

// Default admin user
const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'Admin@123',
  firstName: 'Admin',
  lastName: 'User',
  isEmailVerified: true
};

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Create permissions
    console.log('Creating default permissions...');
    for (const permission of DEFAULT_PERMISSIONS) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: {},
        create: {
          name: permission.name,
          description: permission.description
        }
      });
    }

    // Create roles with permissions
    console.log('Creating default roles...');
    for (const role of DEFAULT_ROLES) {
      // Create or update role
      const createdRole = await prisma.role.upsert({
        where: { name: role.name },
        update: {
          description: role.description
        },
        create: {
          name: role.name,
          description: role.description
        }
      });

      // Get permissions for this role
      const permissions = await prisma.permission.findMany({
        where: {
          name: {
            in: role.permissions
          }
        }
      });

      // Assign permissions to role
      for (const permission of permissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: createdRole.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            roleId: createdRole.id,
            permissionId: permission.id
          }
        });
      }
    }

    // Create admin user
    console.log('Creating default admin user...');
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' }
    });

    if (adminRole) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, salt);

      await prisma.user.upsert({
        where: { email: DEFAULT_ADMIN.email },
        update: {},
        create: {
          email: DEFAULT_ADMIN.email,
          password: hashedPassword,
          firstName: DEFAULT_ADMIN.firstName,
          lastName: DEFAULT_ADMIN.lastName,
          isEmailVerified: DEFAULT_ADMIN.isEmailVerified,
          roleId: adminRole.id
        }
      });
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Run seeder if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed, exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
} 