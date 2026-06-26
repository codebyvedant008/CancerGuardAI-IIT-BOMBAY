from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.utils.security import decode_access_token
from app.models.user import User, Admin, UserRole

# Defines the token URL for swagger login
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    """Dependency to retrieve the currently logged in user based on the JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode the token
    user_id = decode_access_token(token)
    if user_id is None:
        raise credentials_exception
        
    # Query user from DB
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
        
    return user

def require_doctor_role(current_user: User = Depends(get_current_user)) -> User:
    """Guard: allows only users with the DOCTOR role."""
    if current_user.role != UserRole.DOCTOR and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Clinical Doctor role required."
        )
    return current_user

def require_admin_role(current_user: User = Depends(get_current_user)) -> User:
    """Guard: allows only admin users."""
    if not current_user.is_admin and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator role required."
        )
    return current_user

def get_current_admin(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> Admin:
    """Dependency to retrieve the currently logged in admin based on the JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode the token
    admin_id = decode_access_token(token)
    if admin_id is None:
        raise credentials_exception
        
    # Query admin from DB.
    # Note: admins can be either in the Admins table or a user with is_admin=True.
    # Let's first search in the admins table, then in users with is_admin=True.
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if admin:
        return admin
        
    user = db.query(User).filter(User.id == admin_id, User.is_admin == True).first()
    if user:
        # Create a mock/duck-type admin object from the user object if they match
        return user
        
    raise credentials_exception
