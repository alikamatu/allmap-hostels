import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UserGender, UserRole, UserStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../mail/mail.service';
import * as crypto from 'crypto';

export type Gender = UserGender;

export interface UserStats {
  total: number;
  verified: number;
  unverified: number;
  students: number;
  hostel_admins: number;
  super_admins: number;
  pending_verification: number;
  with_school: number;
  without_school: number;
  active_today: number;
  growth_30d: number;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: UserGender | null;
  is_verified: boolean;
  status: 'unverified' | 'pending' | 'verified';
  role: UserRole;
  school_id?: string | null;
  created_at?: Date | null;
  onboarding_completed: boolean;
  terms_accepted: boolean;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relationship?: string | null;
  emergency_contact_email?: string | null;
  school?: {
    id: string;
    name: string;
    domain: string;
  };
  stats?: {
    totalBookings?: number;
    activeBookings?: number;
    totalHostels?: number;
  };
}

function toUserResponse(
  user: Prisma.UserGetPayload<object>,
  school?: { id: string; name: string; domain: string } | null,
  stats?: UserResponse['stats'],
): UserResponse {
  return {
    id: user.id,
    name: user.name ?? '',
    email: user.email,
    phone: user.phone ?? undefined,
    gender: user.gender,
    is_verified: user.isVerified,
    status: user.status as UserResponse['status'],
    role: user.role,
    school_id: user.schoolId,
    created_at: user.createdAt,
    onboarding_completed: user.onboardingCompleted,
    terms_accepted: user.termsAccepted,
    emergency_contact_name: user.emergencyContactName,
    emergency_contact_phone: user.emergencyContactPhone,
    emergency_contact_relationship: user.emergencyContactRelationship,
    emergency_contact_email: user.emergencyContactEmail,
    school: school ?? undefined,
    stats,
  };
}

@Injectable()
export class UserManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async getUsers(filterDto: UserFilterDto): Promise<{
    users: UserResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const {
      role,
      status,
      is_verified,
      school_id,
      search,
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = filterDto;

    const where: Prisma.UserWhereInput = {};
    if (role) where.role = role;
    if (status) where.status = status as UserStatus;
    if (is_verified !== undefined) where.isVerified = is_verified;
    if (school_id) where.schoolId = school_id;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const sortFieldMap: Record<string, Prisma.UserScalarFieldEnum> = {
      created_at: 'createdAt',
      createdAt: 'createdAt',
      email: 'email',
      name: 'name',
      role: 'role',
      status: 'status',
    };
    const orderField = sortFieldMap[sortBy] ?? 'createdAt';
    const orderDir = String(sortOrder).toUpperCase() === 'ASC' ? 'asc' : 'desc';

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { [orderField]: orderDir },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    const schoolIds = [
      ...new Set(users.map((u) => u.schoolId).filter(Boolean)),
    ] as string[];
    const schools =
      schoolIds.length > 0
        ? await this.prisma.school.findMany({
            where: { id: { in: schoolIds } },
          })
        : [];
    const schoolMap = new Map(schools.map((s) => [s.id, s]));

    const userIds = users.map((u) => u.id);
    const statsMap = await this.getBatchUserStats(userIds);

    const usersWithStats = users.map((user) => {
      const sch = user.schoolId ? schoolMap.get(user.schoolId) : null;
      return toUserResponse(
        user,
        sch ? { id: sch.id, name: sch.name, domain: sch.domain } : null,
        statsMap.get(user.id) ?? {
          totalBookings: 0,
          activeBookings: 0,
          totalHostels: 0,
        },
      );
    });

    return {
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOverallUserStats(): Promise<UserStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [byRole, byVerified, byStatus, timeBuckets] = await Promise.all([
      this.prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      this.prisma.user.groupBy({ by: ['isVerified'], _count: { _all: true } }),
      this.prisma.user.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.$queryRaw<
        Array<{
          with_school: bigint;
          without_school: bigint;
          active_today: bigint;
          prev_month: bigint;
        }>
      >`
        SELECT
          COUNT(*) FILTER (WHERE school_id IS NOT NULL)::bigint AS with_school,
          COUNT(*) FILTER (WHERE school_id IS NULL)::bigint AS without_school,
          COUNT(*) FILTER (WHERE created_at >= ${today})::bigint AS active_today,
          COUNT(*) FILTER (WHERE created_at >= ${thirtyDaysAgo} AND created_at < ${today})::bigint AS prev_month
        FROM users
      `,
    ]);

    const roleCount = (r: UserRole) =>
      byRole.find((g) => g.role === r)?._count._all ?? 0;
    const students = roleCount(UserRole.student);
    const hostel_admins = roleCount(UserRole.hostel_admin);
    const super_admins = roleCount(UserRole.super_admin);
    const total = byRole.reduce((s, g) => s + g._count._all, 0);

    const verified =
      byVerified.find((g) => g.isVerified === true)?._count._all ?? 0;
    const unverified =
      byVerified.find((g) => g.isVerified === false)?._count._all ?? 0;
    const pending_verification =
      byStatus.find((g) => g.status === 'pending')?._count._all ?? 0;

    const bucket = timeBuckets[0];
    const with_school = Number(bucket?.with_school ?? 0);
    const without_school = Number(bucket?.without_school ?? 0);
    const active_today = Number(bucket?.active_today ?? 0);
    const previous_month_total = Number(bucket?.prev_month ?? 0);

    const growth_30d =
      previous_month_total > 0
        ? ((active_today - previous_month_total) / previous_month_total) * 100
        : active_today > 0
          ? 100
          : 0;

    return {
      total,
      verified,
      unverified,
      students,
      hostel_admins,
      super_admins,
      pending_verification,
      with_school,
      without_school,
      active_today,
      growth_30d: Math.round(growth_30d * 10) / 10,
    };
  }

  async getBatchUserStats(
    userIds: string[],
  ): Promise<
    Map<
      string,
      { totalBookings: number; activeBookings: number; totalHostels: number }
    >
  > {
    const map = new Map<
      string,
      { totalBookings: number; activeBookings: number; totalHostels: number }
    >();
    if (userIds.length === 0) return map;

    const [bookingGroups, activeBookingGroups, hostelGroups] =
      await Promise.all([
        this.prisma.booking.groupBy({
          by: ['studentId'],
          where: { studentId: { in: userIds } },
          _count: { _all: true },
        }),
        this.prisma.booking.groupBy({
          by: ['studentId'],
          where: {
            studentId: { in: userIds },
            status: { in: ['pending', 'confirmed', 'checked_in'] },
          },
          _count: { _all: true },
        }),
        this.prisma.hostel.groupBy({
          by: ['adminId'],
          where: { adminId: { in: userIds } },
          _count: { _all: true },
        }),
      ]);

    for (const id of userIds) {
      map.set(id, { totalBookings: 0, activeBookings: 0, totalHostels: 0 });
    }
    for (const g of bookingGroups) {
      if (!g.studentId) continue;

      const entry = map.get(g.studentId);
      if (entry) entry.totalBookings = g._count._all;
    }

    for (const g of activeBookingGroups) {
      if (!g.studentId) continue;

      const entry = map.get(g.studentId);
      if (entry) entry.activeBookings = g._count._all;
    }
    for (const g of hostelGroups) {
      const entry = map.get(g.adminId);
      if (entry) entry.totalHostels = g._count._all;
    }
    return map;
  }

  async getUserStats(userId: string) {
    const [totalBookings, activeBookings, totalHostels] = await Promise.all([
      this.prisma.booking.count({ where: { studentId: userId } }),
      this.prisma.booking.count({
        where: {
          studentId: userId,
          status: { in: ['pending', 'confirmed', 'checked_in'] },
        },
      }),
      this.prisma.hostel.count({ where: { adminId: userId } }),
    ]);

    return {
      totalBookings,
      activeBookings,
      totalHostels,
    };
  }

  async getUserById(id: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const school = user.schoolId
      ? await this.prisma.school.findUnique({ where: { id: user.schoolId } })
      : null;
    const stats = await this.getUserStats(user.id);

    return toUserResponse(
      user,
      school
        ? { id: school.id, name: school.name, domain: school.domain }
        : null,
      stats,
    );
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const verificationToken = createUserDto.is_verified
      ? null
      : crypto.randomBytes(32).toString('hex');
    const tokenExpiry = createUserDto.is_verified
      ? null
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const savedUser = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        phone: createUserDto.phone,
        gender: createUserDto.gender,
        passwordHash: hashedPassword,
        role: createUserDto.role ?? UserRole.student,
        schoolId: createUserDto.school_id,
        isVerified: createUserDto.is_verified ?? false,
        verificationToken,
        verificationTokenExpiresAt: tokenExpiry,
        createdAt: createUserDto.is_verified ? new Date() : null,
        status: createUserDto.is_verified ? 'verified' : 'pending',
        termsAccepted: createUserDto.terms_accepted ?? false,
        termsAcceptedAt: createUserDto.terms_accepted ? new Date() : null,
      },
    });

    if (!createUserDto.is_verified && verificationToken) {
      try {
        await this.mailService.sendVerificationEmail(
          savedUser.email,
          verificationToken,
        );
      } catch (error) {
        console.error('Failed to send verification email:', error);
      }
    }

    const stats = await this.getUserStats(savedUser.id);
    return toUserResponse(savedUser, undefined, stats);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    const data: Prisma.UserUpdateInput = {};
    if (updateUserDto.name !== undefined) data.name = updateUserDto.name;
    if (updateUserDto.email !== undefined) data.email = updateUserDto.email;
    if (updateUserDto.phone !== undefined) data.phone = updateUserDto.phone;
    if (updateUserDto.gender !== undefined) data.gender = updateUserDto.gender;
    if (updateUserDto.school_id !== undefined)
      data.schoolId = updateUserDto.school_id;
    if (updateUserDto.emergency_contact_name !== undefined)
      data.emergencyContactName = updateUserDto.emergency_contact_name;
    if (updateUserDto.emergency_contact_phone !== undefined)
      data.emergencyContactPhone = updateUserDto.emergency_contact_phone;
    if (updateUserDto.emergency_contact_relationship !== undefined)
      data.emergencyContactRelationship =
        updateUserDto.emergency_contact_relationship;
    if (updateUserDto.emergency_contact_email !== undefined)
      data.emergencyContactEmail = updateUserDto.emergency_contact_email;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    const stats = await this.getUserStats(updatedUser.id);
    return toUserResponse(updatedUser, undefined, stats);
  }

  async updateUserStatus(
    id: string,
    status: 'unverified' | 'pending' | 'verified',
  ): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        status,
        isVerified: status === 'verified',
        ...(status === 'verified' && !user.createdAt
          ? { createdAt: new Date() }
          : {}),
      },
    });

    const stats = await this.getUserStats(updatedUser.id);
    return toUserResponse(updatedUser, undefined, stats);
  }

  async verifyUser(id: string): Promise<UserResponse> {
    return this.updateUserStatus(id, 'verified');
  }

  async updateUserRole(id: string, role: UserRole): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.hostel_admin && role !== UserRole.hostel_admin) {
      const hasHostels = await this.prisma.hostel.count({
        where: { adminId: id },
      });
      if (hasHostels > 0) {
        throw new BadRequestException(
          'Cannot change role of user who manages hostels. Please transfer hostels first.',
        );
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role },
    });

    const stats = await this.getUserStats(updatedUser.id);
    return toUserResponse(updatedUser, undefined, stats);
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activeBookings = await this.prisma.booking.count({
      where: {
        studentId: id,
        status: { in: ['pending', 'confirmed', 'checked_in'] },
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException(
        'Cannot delete user with active bookings. Cancel bookings first.',
      );
    }

    if (user.role === UserRole.hostel_admin) {
      const hostelsCount = await this.prisma.hostel.count({
        where: { adminId: id },
      });

      if (hostelsCount > 0) {
        throw new BadRequestException(
          'Cannot delete hostel admin with active hostels. Transfer hostels first.',
        );
      }
    }

    await this.prisma.user.update({
      where: { id },
      data: {
        status: 'unverified',
        isVerified: false,
      },
    });

    return { message: 'User deactivated successfully' };
  }

  async sendVerificationEmail(id: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('User is already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id },
      data: {
        verificationToken,
        verificationTokenExpiresAt: tokenExpiry,
      },
    });

    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationToken,
      );
    } catch {
      throw new BadRequestException('Failed to send verification email');
    }

    return { message: 'Verification email sent successfully' };
  }

  async bulkVerifyUsers(
    userIds: string[],
  ): Promise<{ verified: number; failed: string[] }> {
    const result = {
      verified: 0,
      failed: [] as string[],
    };

    for (const userId of userIds) {
      try {
        await this.verifyUser(userId);
        result.verified++;
      } catch {
        result.failed.push(userId);
      }
    }

    return result;
  }

  async bulkDeleteUsers(
    userIds: string[],
  ): Promise<{ deleted: number; failed: string[] }> {
    const result = {
      deleted: 0,
      failed: [] as string[],
    };

    for (const userId of userIds) {
      try {
        await this.deleteUser(userId);
        result.deleted++;
      } catch {
        result.failed.push(userId);
      }
    }

    return result;
  }

  async exportUsers(filterDto: UserFilterDto): Promise<string> {
    const { users } = await this.getUsers({ ...filterDto, limit: 1000 });

    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Role',
      'Status',
      'Verified',
      'School',
      'Created At',
      'Total Bookings',
      'Active Bookings',
      'Hostels Managed',
    ];

    const rows: string[][] = users.map((user) => [
      user.id,
      user.name || '',
      user.email,
      user.phone || '',
      user.role,
      user.status,
      user.is_verified ? 'Yes' : 'No',
      user.school?.name || '',
      user.created_at ? new Date(user.created_at).toISOString() : '',
      String(user.stats?.totalBookings || 0),
      String(user.stats?.activeBookings || 0),
      String(user.stats?.totalHostels || 0),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }
}
