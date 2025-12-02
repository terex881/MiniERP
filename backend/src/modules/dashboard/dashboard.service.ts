import { prisma } from '../../config/database';

interface DashboardStats {
  users?: {
    total: number;
    active: number;
    byRole: { role: string; count: number }[];
  };
  leads: {
    total: number;
    new: number;
    converted: number;
    conversionRate: number;
  };
  clients: {
    total: number;
    active: number;
    withSubscriptions: number;
  };
  claims: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  revenue?: {
    monthlyRecurring: number;
    yearlyProjected: number;
  };
  recentActivity: {
    id: string;
    action: string;
    description: string;
    createdAt: Date;
    user: { firstName: string; lastName: string };
  }[];
}

interface ClientPortalStats {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    company: string | null;
  };
  subscriptions: {
    active: number;
    total: number;
    monthlySpend: number;
  };
  claims: {
    total: number;
    open: number;
    resolved: number;
  };
  recentClaims: {
    id: string;
    title: string;
    status: string;
    createdAt: Date;
  }[];
}

class DashboardService {
  /**
   * Get admin dashboard stats (full access)
   */
  async getAdminStats(): Promise<DashboardStats> {
    const [
      userStats,
      usersByRole,
      leadStats,
      clientStats,
      claimStats,
      revenueStats,
      recentActivity,
    ] = await Promise.all([
      // User stats
      prisma.user.aggregate({
        _count: { id: true },
        where: {},
      }).then(async (total) => ({
        total: total._count.id,
        active: await prisma.user.count({ where: { isActive: true } }),
      })),
      
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      
      // Lead stats
      this.getLeadStats(),
      
      // Client stats
      this.getClientStats(),
      
      // Claim stats
      this.getClaimStats(),
      
      // Revenue stats
      this.getRevenueStats(),
      
      // Recent activity
      this.getRecentActivity(10),
    ]);

    return {
      users: {
        total: userStats.total,
        active: userStats.active,
        byRole: usersByRole.map((r) => ({ role: r.role, count: r._count.role })),
      },
      leads: leadStats,
      clients: clientStats,
      claims: claimStats,
      revenue: revenueStats,
      recentActivity,
    };
  }

  /**
   * Get supervisor dashboard stats
   */
  async getSupervisorStats(): Promise<DashboardStats> {
    const [leadStats, clientStats, claimStats, revenueStats, recentActivity] = await Promise.all([
      this.getLeadStats(),
      this.getClientStats(),
      this.getClaimStats(),
      this.getRevenueStats(),
      this.getRecentActivity(10),
    ]);

    return {
      leads: leadStats,
      clients: clientStats,
      claims: claimStats,
      revenue: revenueStats,
      recentActivity,
    };
  }

  /**
   * Get operator dashboard stats (limited to assigned items)
   */
  async getOperatorStats(userId: string): Promise<DashboardStats> {
    const [leadStats, claimStats, recentActivity] = await Promise.all([
      // Lead stats for operator
      prisma.lead.aggregate({
        _count: { id: true },
        where: {
          OR: [{ assignedToId: userId }, { createdById: userId }],
        },
      }).then(async (total) => {
        const newLeads = await prisma.lead.count({
          where: {
            OR: [{ assignedToId: userId }, { createdById: userId }],
            status: 'NEW',
          },
        });
        const converted = await prisma.lead.count({
          where: {
            OR: [{ assignedToId: userId }, { createdById: userId }],
            status: 'CONVERTED',
          },
        });
        return {
          total: total._count.id,
          new: newLeads,
          converted,
          conversionRate: total._count.id > 0 ? (converted / total._count.id) * 100 : 0,
        };
      }),
      
      // Claim stats for operator
      prisma.claim.aggregate({
        _count: { id: true },
        where: { assignedToId: userId },
      }).then(async (total) => {
        const open = await prisma.claim.count({
          where: { assignedToId: userId, status: 'OPEN' },
        });
        const inProgress = await prisma.claim.count({
          where: { assignedToId: userId, status: 'IN_PROGRESS' },
        });
        const resolved = await prisma.claim.count({
          where: { assignedToId: userId, status: { in: ['RESOLVED', 'CLOSED'] } },
        });
        return { total: total._count.id, open, inProgress, resolved };
      }),
      
      // Recent activity for operator
      prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          action: true,
          description: true,
          createdAt: true,
          user: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
    ]);

    return {
      leads: leadStats,
      clients: { total: 0, active: 0, withSubscriptions: 0 },
      claims: claimStats,
      recentActivity,
    };
  }

  /**
   * Get client portal dashboard stats
   */
  async getClientPortalStats(clientId: string): Promise<ClientPortalStats> {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        company: true,
        subscriptions: {
          where: { isActive: true },
          select: {
            quantity: true,
            customPrice: true,
            product: {
              select: {
                price: true,
                billingCycle: true,
              },
            },
          },
        },
        claims: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            claims: true,
            subscriptions: true,
          },
        },
      },
    });

    if (!client) {
      throw new Error('Client not found');
    }

    // Calculate monthly spend
    let monthlySpend = 0;
    for (const sub of client.subscriptions) {
      const price = sub.customPrice?.toNumber() || sub.product.price.toNumber();
      let monthly = price * sub.quantity;
      if (sub.product.billingCycle === 'yearly') {
        monthly = monthly / 12;
      } else if (sub.product.billingCycle === 'one-time') {
        monthly = 0;
      }
      monthlySpend += monthly;
    }

    // Count claims by status
    const openClaims = await prisma.claim.count({
      where: { clientId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
    });
    const resolvedClaims = await prisma.claim.count({
      where: { clientId, status: { in: ['RESOLVED', 'CLOSED'] } },
    });

    return {
      profile: {
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        company: client.company,
      },
      subscriptions: {
        active: client.subscriptions.length,
        total: client._count.subscriptions,
        monthlySpend,
      },
      claims: {
        total: client._count.claims,
        open: openClaims,
        resolved: resolvedClaims,
      },
      recentClaims: client.claims,
    };
  }

  // Helper methods
  private async getLeadStats() {
    const total = await prisma.lead.count();
    const newLeads = await prisma.lead.count({ where: { status: 'NEW' } });
    const converted = await prisma.lead.count({ where: { status: 'CONVERTED' } });

    return {
      total,
      new: newLeads,
      converted,
      conversionRate: total > 0 ? (converted / total) * 100 : 0,
    };
  }

  private async getClientStats() {
    const total = await prisma.client.count();
    const active = await prisma.client.count({ where: { isActive: true } });
    const withSubscriptions = await prisma.client.count({
      where: {
        subscriptions: { some: { isActive: true } },
      },
    });

    return { total, active, withSubscriptions };
  }

  private async getClaimStats() {
    const total = await prisma.claim.count();
    const open = await prisma.claim.count({ where: { status: 'OPEN' } });
    const inProgress = await prisma.claim.count({ where: { status: 'IN_PROGRESS' } });
    const resolved = await prisma.claim.count({
      where: { status: { in: ['RESOLVED', 'CLOSED'] } },
    });

    return { total, open, inProgress, resolved };
  }

  private async getRevenueStats() {
    const subscriptions = await prisma.clientProduct.findMany({
      where: { isActive: true },
      select: {
        quantity: true,
        customPrice: true,
        product: {
          select: {
            price: true,
            billingCycle: true,
          },
        },
      },
    });

    let monthlyRecurring = 0;
    for (const sub of subscriptions) {
      const price = sub.customPrice?.toNumber() || sub.product.price.toNumber();
      let monthly = price * sub.quantity;
      if (sub.product.billingCycle === 'yearly') {
        monthly = monthly / 12;
      } else if (sub.product.billingCycle === 'one-time') {
        monthly = 0;
      }
      monthlyRecurring += monthly;
    }

    return {
      monthlyRecurring,
      yearlyProjected: monthlyRecurring * 12,
    };
  }

  private async getRecentActivity(limit: number) {
    return prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        description: true,
        createdAt: true,
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }
}

export const dashboardService = new DashboardService();

