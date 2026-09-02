export type Role = "USER" | "PARKING_MANAGER" | "ADMIN";
export type VehicleType = "Car" | "Bike" | "SUV" | "EV";
export type SlotStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
export type BookingStatus = "UPCOMING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: Role;
  vehicle_number?: string;
  vehicle_type?: VehicleType;
  is_active: boolean;
  wallet_balance: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: number;
  wallet_id: number;
  type: "WELCOME_CREDIT" | "CREDIT_PURCHASE" | "BOOKING_PAYMENT" | "BOOKING_REFUND" | "ADMIN_ADJUSTMENT";
  credits: number;
  description?: string;
  reference_id?: string;
  status: string;
  created_at: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_inr: number;
  popular: boolean;
  badge?: string;
}

export interface Payment {
  id: number;
  user_id: number;
  amount: number;
  credits: number;
  package_name: string;
  payment_method: string;
  transaction_id: string;
  qr_token?: string;
  status: "PENDING_APPROVAL" | "COMPLETED" | "REJECTED" | string;
  manager_id?: number;
  parking_id?: number;
  approved_at?: string;
  created_at: string;
}

export interface Wallet {
  id: number;
  user_id: number;
  balance: number;
  created_at: string;
  updated_at: string;
  recent_transactions: WalletTransaction[];
}

export interface ParkingSlot {
  id: number;
  parking_id: number;
  slot_number: string;
  vehicle_type: VehicleType;
  status: SlotStatus;
  floor_level?: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ParkingLocation {
  id: number;
  manager_id?: number;
  name: string;
  address: string;
  city?: string;
  latitude: number;
  longitude: number;
  total_slots: number;
  available_slots: number;
  occupied_slots?: number;
  price_per_hour: number;
  opening_time: string;
  closing_time: string;
  supported_vehicle_types?: string;
  facilities?: string;
  description?: string;
  image_url?: string;
  status: "ACTIVE" | "PENDING" | "INACTIVE";
  rating: number;
  review_count: number;
  distance_km?: number;
  slots?: ParkingSlot[];
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  booking_number: string;
  user_id: number;
  parking_id: number;
  slot_id: number;
  vehicle_number: string;
  vehicle_type: VehicleType;
  start_time: string;
  end_time: string;
  duration_hours: number;
  credits: number;
  status: BookingStatus;
  qr_token: string;
  entry_time?: string;
  exit_time?: string;
  created_at: string;
  updated_at: string;
  parking?: ParkingLocation;
  slot?: ParkingSlot;
}

export interface Review {
  id: number;
  user_id: number;
  parking_id: number;
  booking_id: number;
  rating: number;
  comment?: string;
  user_name?: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface ManagerStats {
  total_slots: number;
  available_slots: number;
  occupied_slots: number;
  reserved_slots: number;
  maintenance_slots: number;
  today_bookings: number;
  today_revenue: number;
  current_occupancy_percent: number;
}

export interface ManagerDashboardData {
  stats: ManagerStats;
  parking_locations_count: number;
  recent_bookings: Booking[];
  daily_bookings_chart: { date: string; bookings: number }[];
  revenue_chart: { date: string; revenue: number }[];
  occupancy_chart: { date: string; occupancy_percent: number }[];
}

export interface AdminStats {
  total_users: number;
  total_managers: number;
  total_parking_locations: number;
  total_parking_slots: number;
  active_bookings: number;
  today_bookings: number;
  today_revenue: number;
  total_credits_issued: number;
  total_credits_spent: number;
}

export interface AdminDashboardData {
  stats: AdminStats;
  recent_users: User[];
  recent_bookings: Booking[];
  user_growth_chart: { date: string; total_users: number }[];
  revenue_chart: { date: string; revenue: number }[];
  occupancy_chart: { date: string; occupancy_percent: number }[];
  popular_parkings: { id: number; name: string; city: string; rating: number; bookings: number }[];
}
