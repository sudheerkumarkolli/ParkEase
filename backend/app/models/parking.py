import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class ParkingStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    PENDING = "PENDING"
    INACTIVE = "INACTIVE"

class SlotStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    OCCUPIED = "OCCUPIED"
    RESERVED = "RESERVED"
    MAINTENANCE = "MAINTENANCE"

class ParkingLocation(Base):
    __tablename__ = "parking_locations"

    id = Column(Integer, primary_key=True, index=True)
    manager_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), index=True, nullable=False)
    address = Column(String(500), nullable=False)
    state = Column(String(100), nullable=True, default="Andhra Pradesh")
    city = Column(String(100), nullable=True)
    area = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    total_slots = Column(Integer, default=0, nullable=False)
    available_slots = Column(Integer, default=0, nullable=False)
    price_per_hour = Column(Integer, default=20, nullable=False)  # in credits
    opening_time = Column(String(20), default="06:00", nullable=False)
    closing_time = Column(String(20), default="23:00", nullable=False)
    status = Column(String(50), default="ACTIVE", nullable=False)
    rating = Column(Float, default=0.0, nullable=False)
    review_count = Column(Integer, default=0, nullable=False)
    supported_vehicle_types = Column(String(255), default="Car,Bike,SUV,EV", nullable=True)
    facilities = Column(String(500), default="CCTV,EV Charging,Covered Parking,Security Guard", nullable=True)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    manager = relationship("User", back_populates="managed_parkings")
    slots = relationship("ParkingSlot", back_populates="parking", cascade="all, delete-orphan", order_by="ParkingSlot.slot_number")
    bookings = relationship("Booking", back_populates="parking", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="parking", cascade="all, delete-orphan")

class ParkingSlot(Base):
    __tablename__ = "parking_slots"

    id = Column(Integer, primary_key=True, index=True)
    parking_id = Column(Integer, ForeignKey("parking_locations.id", ondelete="CASCADE"), nullable=False)
    slot_number = Column(String(50), nullable=False)
    vehicle_type = Column(String(50), default="Car", nullable=False)
    status = Column(String(50), default="AVAILABLE", nullable=False)  # AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    parking = relationship("ParkingLocation", back_populates="slots")
    bookings = relationship("Booking", back_populates="slot")
