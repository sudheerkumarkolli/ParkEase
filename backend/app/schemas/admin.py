from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.user import UserResponse
from app.schemas.parking import ParkingLocationResponse
from app.schemas.booking import BookingResponse
from app.schemas.wallet import WalletTransactionResponse

class AdminStats(BaseModel):
    total_users: int
    total_managers: int
    total_parking_locations: int
    total_parking_slots: int
    active_bookings: int
    today_bookings: int
    today_revenue: int
    total_credits_issued: int
    total_credits_spent: int

class AdminDashboardResponse(BaseModel):
    stats: AdminStats
    recent_users: List[UserResponse]
    recent_bookings: List[BookingResponse]
    user_growth_chart: List[dict]
    revenue_chart: List[dict]
    occupancy_chart: List[dict]
    popular_parkings: List[dict]
