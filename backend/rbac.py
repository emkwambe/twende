"""Role-based access control helpers and FastAPI dependencies."""
from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies import get_current_user
from models import Member, User


class Permission:
    # Global roles
    USER = "user"
    AGENT = "agent"
    ADMIN = "admin"

    # Group roles
    GROUP_MEMBER = "member"
    GROUP_TREASURER = "treasurer"
    GROUP_CHAIR = "chair"


class GroupRole:
    MEMBER = "member"
    TREASURER = "treasurer"
    CHAIR = "chair"


GROUP_ROLE_HIERARCHY = {
    GroupRole.MEMBER: 0,
    GroupRole.TREASURER: 1,
    GroupRole.CHAIR: 2,
}


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != Permission.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def require_agent_or_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in (Permission.AGENT, Permission.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Agent or admin access required",
        )
    return current_user


def get_group_membership(
    group_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Member:
    """Return the current user's membership in a group, or 403."""
    if current_user.role == Permission.ADMIN:
        # Admins can act on any group, but still need a membership proxy.
        member = db.query(Member).filter(Member.group_id == group_id).first()
        if not member:
            raise HTTPException(status_code=404, detail="Group not found")
        return member

    member = (
        db.query(Member)
        .filter(Member.group_id == group_id, Member.user_id == current_user.id)
        .first()
    )
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group",
        )
    return member


def require_group_role(min_role: str):
    """Dependency factory that requires at least the given group role."""

    def checker(
        group_id: UUID,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> Member:
        if current_user.role == Permission.ADMIN:
            member = db.query(Member).filter(Member.group_id == group_id).first()
            if not member:
                raise HTTPException(status_code=404, detail="Group not found")
            return member

        member = (
            db.query(Member)
            .filter(Member.group_id == group_id, Member.user_id == current_user.id)
            .first()
        )
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this group",
            )
        if GROUP_ROLE_HIERARCHY.get(member.role, 0) < GROUP_ROLE_HIERARCHY.get(min_role, 0):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"{min_role} role or higher required",
            )
        return member

    return checker


def is_group_admin(member: Member) -> bool:
    return member.role in (GroupRole.TREASURER, GroupRole.CHAIR)
