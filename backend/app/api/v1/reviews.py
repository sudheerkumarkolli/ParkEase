from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database.session import get_db
from app.models.booking import Booking, BookingStatus, Review
from app.models.parking import ParkingLocation
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services.auth_service import get_current_active_user
from app.core.exceptions import NotFoundException, BadRequestException, ConflictException, ForbiddenException

router = APIRouter()

@router.post("", response_model=ReviewResponse)
def submit_review(
    req: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.id == req.booking_id).first()
    if not booking:
        raise NotFoundException("Booking not found")

    if booking.user_id != current_user.id:
        raise ForbiddenException("You can only review your own bookings")

    if booking.status != BookingStatus.COMPLETED.value:
        raise BadRequestException("You can only review a parking location after your booking is COMPLETED")

    # Check if already reviewed
    existing_review = db.query(Review).filter(Review.booking_id == req.booking_id).first()
    if existing_review:
        raise ConflictException("You have already reviewed this booking")

    review = Review(
        user_id=current_user.id,
        parking_id=booking.parking_id,
        booking_id=booking.id,
        rating=req.rating,
        comment=req.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate average rating for parking location
    parking = db.query(ParkingLocation).filter(ParkingLocation.id == booking.parking_id).first()
    if parking:
        stats = db.query(
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("count")
        ).filter(Review.parking_id == parking.id).first()

        parking.rating = round(float(stats.avg_rating or 0.0), 1)
        parking.review_count = int(stats.count or 0)
        db.commit()

    return {
        "id": review.id,
        "user_id": review.user_id,
        "parking_id": review.parking_id,
        "booking_id": review.booking_id,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at,
        "user_name": current_user.full_name
    }

@router.get("/parking/{parking_id}", response_model=List[ReviewResponse])
def get_parking_reviews(parking_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(
        Review.parking_id == parking_id
    ).order_by(desc(Review.created_at)).all()

    results = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        results.append({
            "id": r.id,
            "user_id": r.user_id,
            "parking_id": r.parking_id,
            "booking_id": r.booking_id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at,
            "user_name": user.full_name if user else "Anonymous User"
        })
    return results
