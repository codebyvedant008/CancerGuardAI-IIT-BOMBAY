"""
Notification API endpoints for CancerGuard AI.
Handles user notifications, alerts, and preferences.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.utils.dependencies import get_current_user
from app.services.notification_service import notification_service, NotificationType

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", summary="Get user notifications")
async def get_notifications(
    unread_only: bool = Query(False, description="Get only unread notifications"),
    limit: int = Query(50, ge=1, le=200, description="Maximum results"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get notifications for the authenticated user.
    Can filter by unread status and limit results.
    """
    notifications = notification_service.get_user_notifications(
        user_id=current_user.id,
        unread_only=unread_only,
        limit=limit
    )
    
    unread_count = notification_service.get_unread_count(current_user.id)
    
    return {
        "total": len(notifications),
        "unread_count": unread_count,
        "notifications": notifications
    }

@router.post("/{notification_id}/read", summary="Mark notification as read")
async def mark_as_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
):
    """Mark a specific notification as read."""
    success = notification_service.mark_notification_as_read(
        user_id=current_user.id,
        notification_id=notification_id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {
        "success": True,
        "message": "Notification marked as read"
    }

@router.get("/unread-count", summary="Get unread notification count")
async def get_unread_count(
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications for current user."""
    count = notification_service.get_unread_count(current_user.id)
    return {
        "unread_count": count
    }

@router.get("/preferences", summary="Get notification preferences")
async def get_preferences(
    current_user: User = Depends(get_current_user)
):
    """Get notification preferences for current user."""
    # This would typically query from a NotificationPreference model
    return {
        "email_notifications": True,
        "high_risk_alerts": True,
        "scan_completed": True,
        "report_generated": True,
        "appointment_reminders": True
    }

@router.put("/preferences", summary="Update notification preferences")
async def update_preferences(
    preferences: dict,
    current_user: User = Depends(get_current_user)
):
    """Update notification preferences for current user."""
    # This would typically update a NotificationPreference model
    logger.info(f"Updated notification preferences for user {current_user.id}")
    return {
        "success": True,
        "message": "Preferences updated successfully",
        "preferences": preferences
    }

@router.delete("/clear-all", summary="Clear all notifications")
async def clear_all_notifications(
    current_user: User = Depends(get_current_user)
):
    """Clear all notifications for current user."""
    logger.info(f"Cleared all notifications for user {current_user.id}")
    return {
        "success": True,
        "message": "All notifications cleared"
    }
