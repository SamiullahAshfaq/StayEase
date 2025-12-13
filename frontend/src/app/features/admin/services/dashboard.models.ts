export interface DashboardStats {
  revenueStats: RevenueStats;
  bookingStats: BookingStats;
  userStats: UserStats;
  listingStats: ListingStats;
  recentActivity: RecentActivityStats;
  generatedAt: string;
}

export interface RevenueStats {
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  averageBookingValue: number;
  pendingPayments: number;
  completedPayments: number;
  revenueGrowthPercentage: number;
  totalTransactions: number;
}

export interface BookingStats {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  cancellationRate: number;
  occupancyRate: number;
  averageStayDuration: number;
}

export interface UserStats {
  totalUsers: number;
  totalTenants: number;
  totalLandlords: number;
  totalAdmins: number;
  activeUsers: number;
  inactiveUsers: number;
  todayRegistrations: number;
  weekRegistrations: number;
  monthRegistrations: number;
  verifiedUsers: number;
  userGrowthPercentage: number;
}

export interface ListingStats {
  totalListings: number;
  activeListings: number;
  pendingApproval: number;
  rejectedListings: number;
  featuredListings: number;
  todayListings: number;
  weekListings: number;
  monthListings: number;
  averageRating: number;
  averageOccupancyRate: number;
}

export interface RecentActivityStats {
  recentLogins: number;
  recentBookings: number;
  recentCancellations: number;
  recentPayments: number;
  pendingApprovals: number;
  recentReviews: number;
}

export interface RevenueChartData {
  dailyRevenue: DataPoint[];
  monthlyRevenue?: DataPoint[];
  paymentMethods: PaymentMethodBreakdown[];
  revenueByCategory?: RevenueByCategory[];
}

export interface DataPoint {
  date: string;
  label: string;
  value: number;
  count: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface RevenueByCategory {
  category: string;
  amount: number;
  bookings: number;
  percentage: number;
}

export interface BookingChartData {
  bookingTrends: BookingTrend[];
  statusDistribution: StatusDistribution[];
  cancellationReasons?: CancellationData[];
  peakTimes?: PeakTime[];
}

export interface BookingTrend {
  date: string;
  label: string;
  bookings: number;
  cancellations: number;
  completions: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface CancellationData {
  reason: string;
  count: number;
  percentage: number;
}

export interface PeakTime {
  timeSlot: string;
  dayOfWeek: number;
  bookingCount: number;
  label: string;
}

export interface UserChartData {
  userGrowth: UserGrowth[];
  userTypes: UserTypeDistribution[];
  activityHeatmap?: ActivityHeatmap[];
  topActiveUsers?: TopUser[];
}

export interface UserGrowth {
  date: string;
  label: string;
  newUsers: number;
  totalUsers: number;
  activeUsers: number;
}

export interface UserTypeDistribution {
  userType: string;
  count: number;
  percentage: number;
}

export interface ActivityHeatmap {
  hour: number;
  dayOfWeek: number;
  activityCount: number;
  label: string;
}

export interface TopUser {
  userId: string;
  userName: string;
  email: string;
  bookingCount: number;
  loginCount: number;
  userType: string;
}

export interface ListingChartData {
  listingsByLocation?: ListingDistribution[];
  listingsByType: ListingByType[];
  occupancyRates?: OccupancyData[];
  topPerformingListings?: TopListing[];
}

export interface ListingDistribution {
  location: string;
  city: string;
  country: string;
  count: number;
  percentage: number;
}

export interface ListingByType {
  propertyType: string;
  count: number;
  percentage: number;
  averagePrice: number;
}

export interface OccupancyData {
  listingId: string;
  listingTitle: string;
  occupancyRate: number;
  totalBookings: number;
}

export interface TopListing {
  listingId: string;
  title: string;
  landlordName: string;
  bookingCount: number;
  totalRevenue: number;
  averageRating: number;
}
