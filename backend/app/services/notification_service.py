"""
Enhanced notification and email service for CancerGuard AI.
Handles user notifications, alerts, and email communications.
"""
import logging
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum
from dataclasses import dataclass

logger = logging.getLogger(__name__)

class NotificationType(str, Enum):
    """Types of notifications."""
    SCAN_COMPLETED = "scan_completed"
    HIGH_RISK_ALERT = "high_risk_alert"
    REPORT_GENERATED = "report_generated"
    SYSTEM_ALERT = "system_alert"
    APPOINTMENT_REMINDER = "appointment_reminder"

@dataclass
class Notification:
    """Notification object."""
    user_id: str
    title: str
    message: str
    notification_type: NotificationType
    is_read: bool = False
    created_at: datetime = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.utcnow()

class NotificationService:
    """Service for managing notifications and alerts."""
    
    def __init__(self):
        self.notifications_store: Dict[str, List[Notification]] = {}
    
    async def create_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        notification_type: NotificationType,
        send_email: bool = False,
        email: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new notification for a user."""
        try:
            notification = Notification(
                user_id=user_id,
                title=title,
                message=message,
                notification_type=notification_type
            )
            
            # Store notification
            if user_id not in self.notifications_store:
                self.notifications_store[user_id] = []
            
            self.notifications_store[user_id].append(notification)
            
            # Send email if requested
            if send_email and email:
                await self.send_email_notification(
                    email=email,
                    title=title,
                    message=message,
                    notification_type=notification_type
                )
            
            logger.info(f"Notification created for user {user_id}")
            return {
                "success": True,
                "notification_id": id(notification),
                "created_at": notification.created_at.isoformat()
            }
        except Exception as e:
            logger.error(f"Error creating notification: {e}")
            return {"success": False, "error": str(e)}
    
    async def send_email_notification(
        self,
        email: str,
        title: str,
        message: str,
        notification_type: NotificationType
    ) -> bool:
        """Send email notification to user."""
        try:
            # This is a placeholder for email integration
            # In production, integrate with services like SendGrid, AWS SES, or Mailgun
            logger.info(f"Email notification sent to {email}: {title}")
            return True
        except Exception as e:
            logger.error(f"Error sending email notification: {e}")
            return False
    
    async def create_scan_completion_notification(
        self,
        user_id: str,
        cancer_type: str,
        prediction: str,
        email: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create notification for completed scan."""
        title = f"✅ Scan Analysis Complete - {cancer_type.title()}"
        message = f"Your {cancer_type} scan has been analyzed. Risk Level: {prediction}"
        
        return await self.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=NotificationType.SCAN_COMPLETED,
            send_email=True,
            email=email
        )
    
    async def create_high_risk_alert(
        self,
        user_id: str,
        cancer_type: str,
        confidence: float,
        email: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create high-risk alert notification."""
        title = f"⚠️ High Risk Alert - {cancer_type.title()}"
        message = f"A recent scan shows HIGH RISK with {confidence}% confidence. Please consult a healthcare professional immediately."
        
        return await self.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=NotificationType.HIGH_RISK_ALERT,
            send_email=True,
            email=email
        )
    
    async def create_report_generated_notification(
        self,
        user_id: str,
        report_id: str,
        email: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create notification for generated report."""
        title = "📄 Clinical Report Generated"
        message = f"Your clinical report (ID: {report_id[:8]}...) is ready for download."
        
        return await self.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=NotificationType.REPORT_GENERATED,
            send_email=True,
            email=email
        )
    
    def get_user_notifications(
        self,
        user_id: str,
        unread_only: bool = False,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get notifications for a user."""
        if user_id not in self.notifications_store:
            return []
        
        notifications = self.notifications_store[user_id]
        
        if unread_only:
            notifications = [n for n in notifications if not n.is_read]
        
        # Return most recent first
        return [
            {
                "id": id(n),
                "title": n.title,
                "message": n.message,
                "type": n.notification_type.value,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat()
            }
            for n in sorted(notifications, key=lambda x: x.created_at, reverse=True)[:limit]
        ]
    
    def mark_notification_as_read(
        self,
        user_id: str,
        notification_id: str
    ) -> bool:
        """Mark notification as read."""
        if user_id in self.notifications_store:
            for notification in self.notifications_store[user_id]:
                if id(notification) == int(notification_id):
                    notification.is_read = True
                    return True
        return False
    
    def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications for user."""
        if user_id not in self.notifications_store:
            return 0
        return sum(1 for n in self.notifications_store[user_id] if not n.is_read)

# Global notification service instance
notification_service = NotificationService()
