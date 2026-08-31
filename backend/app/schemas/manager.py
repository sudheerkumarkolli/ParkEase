from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.booking import BookingResponse

class ScanRequest(BaseModel):
    qr_token: str
    parking_id: Optional[int] = None

class ScanResponse(BaseModel):
    success: bool
    action: str  # ENTRY_APPROVED or EXIT_APPROVED or INVALID
    message: str
    booking: Optional[BookingResponse] = None

class ManagerStats(BaseModel):
    total_slots: int
    available_slots: int
    occupied_slots: int
    reserved_slots: int
    maintenance_slots: int
    today_bookings: int
    today_revenue: int
    current_occupancy_percent: float

class ManagerDashboardResponse(BaseModel):
    stats: ManagerStats
    parking_locations_count: int
    recent_bookings: List[BookingResponse]
    daily_bookings_chart: List[dict]
    revenue_chart: List[dict]
    occupancy_chart: List[dict]
