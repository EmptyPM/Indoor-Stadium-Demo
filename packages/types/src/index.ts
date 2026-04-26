// ─── Enums ───────────────────────────────────────────────────────────────────

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

export enum SportType {
  BADMINTON = 'BADMINTON',
  TENNIS = 'TENNIS',
  BASKETBALL = 'BASKETBALL',
  VOLLEYBALL = 'VOLLEYBALL',
  FOOTBALL = 'FOOTBALL',
  SQUASH = 'SQUASH',
  TABLE_TENNIS = 'TABLE_TENNIS',
  CRICKET = 'CRICKET',
  OTHER = 'OTHER',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

// ─── User Types ───────────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProfile extends IUser {
  stadiums?: IStadium[];
  bookings?: IBooking[];
}

// ─── Stadium Types ────────────────────────────────────────────────────────────

export interface IStadium {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  isActive: boolean;
  managerId: string;
  courts?: ICourt[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Court Types ──────────────────────────────────────────────────────────────

export interface ICourt {
  id: string;
  name: string;
  sportType: SportType;
  description?: string;
  capacity: number;
  isIndoor: boolean;
  isActive: boolean;
  stadiumId: string;
  stadium?: IStadium;
  pricings?: IPricing[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Booking Types ────────────────────────────────────────────────────────────

export interface IBooking {
  id: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalPrice: number;
  status: BookingStatus;
  notes?: string;
  courtId: string;
  court?: ICourt;
  userId: string;
  user?: IUser;
  payment?: IPayment;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  price: number;
}

// ─── Payment Types ────────────────────────────────────────────────────────────

export interface IPayment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  transactionId?: string;
  bookingId: string;
  booking?: IBooking;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Pricing Types ────────────────────────────────────────────────────────────

export interface IPricing {
  id: string;
  name: string;
  pricePerHour: number;
  startTime: string;
  endTime: string;
  dayOfWeek?: number[];
  isWeekend: boolean;
  courtId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: IUser;
  tokens: IAuthTokens;
}

export interface ILoginDto {
  email: string;
  password: string;
}

export interface IRegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// ─── Query Types ──────────────────────────────────────────────────────────────

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IBookingQuery extends IPaginationQuery {
  status?: BookingStatus;
  courtId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface IAvailabilityQuery {
  courtId: string;
  date: string;
}
