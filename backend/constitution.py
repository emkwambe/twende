"""Digital constitution (katiba) generator for Tanzanian savings groups.

Produces a bilingual Swahili/English constitution from the group record and its
member registry, so a VICOBA/Upatu group has the written document it needs for
formal registration at ward/district level.
"""
from decimal import Decimal
from typing import List, Optional

from models import Group, Member

JOINING_FEE_TZS = 5_000


def _find_role(members: List[Member], role: str) -> Optional[Member]:
    """First active member holding the given group role, if any."""
    for member in members:
        if (member.role or "").lower() == role and (member.status or "active") == "active":
            return member
    return None


def _weekly_contribution(group: Group) -> int:
    total = group.total_savings or Decimal("0")
    return int(total / max(group.member_count or 1, 1))


def generate_constitution(group: Group, members: List[Member]) -> str:
    """Render the full bilingual constitution text for a group."""
    chair = _find_role(members, "chair")
    treasurer = _find_role(members, "treasurer")
    secretary = _find_role(members, "secretary")

    # Prefer the name recorded on the group; fall back to the elected chair member.
    chair_name = group.chair_name or (chair.full_name if chair else "Not elected")

    established = (
        group.created_at.strftime("%d %B %Y") if group.created_at else "Haijulikani / Unknown"
    )
    location = ", ".join(part for part in (group.location, group.region) if part) or "—"

    if members:
        member_lines = "\n".join(
            f"  {idx}. {m.full_name} — NIDA: {m.national_id or 'Haijasajiliwa / Not provided'}"
            for idx, m in enumerate(members, start=1)
        )
    else:
        member_lines = "  (Hakuna wanachama waliosajiliwa / No members registered)"

    return f"""KATIBA YA KIKUNDI / GROUP CONSTITUTION

JINA LA KIKUNDI / GROUP NAME: {group.name}
AINA YA KIKUNDI / GROUP TYPE: {(group.group_type or "vicoba").upper()}
MAHALI / LOCATION: {location}
ILIANZISHWA / ESTABLISHED: {established}

SEHEMU YA 1: MALENGO / OBJECTIVES
- Kuimarisha uchumi wa wanachama kwa akiba na mikopo
- To strengthen members' economic status through savings and loans
- Kuwezesha biashara ndogo na za kati
- To facilitate small and medium enterprises

SEHEMU YA 2: USAJILI WA WANACHAMA / MEMBERSHIP
- Kila mwanachama anahitaji NIDA namba / Every member requires a NIDA number:
{member_lines}
- Kila mwanachama analipa hisa ya kujiunga: TZS {JOINING_FEE_TZS:,}
- Kila mwanachama ana haki ya kupiga kura

SEHEMU YA 3: UONGOZI / LEADERSHIP
- Mwenyekiti / Chair: {chair_name}
- Mhazini / Treasurer: {treasurer.full_name if treasurer else "Not elected"}
- Katibu / Secretary: {secretary.full_name if secretary else "Not elected"}
- Muda wa mihula / Term: Miaka 2 (2 years)

SEHEMU YA 4: MKUTANO / MEETINGS
- Mkutano utafanyika: {group.meeting_frequency or "weekly"}
- Mahali: {group.location or "—"}

SEHEMU YA 5: AKIBA / SAVINGS
- Kila mwanachama analipa: TZS {_weekly_contribution(group):,} kwa wiki
- Riba ya akiba: {group.interest_rate}% kwa mwaka

SEHEMU YA 6: MIKOPO / LOANS
- Kiwango cha mkopo: Si kuzidi mara 4 ya akiba ya kikundi
- Riba ya mkopo: {group.interest_rate}% kwa mwaka
- Muda wa marejesho: Kulingana na mkataba

SEHEMU YA 7: KUTATUA MIGOGORO / DISPUTE RESOLUTION
- Migogoro itatatuliwa na kamati ya uongozi
- Ikiwa haijatatuliwa, itapelekwa kwenye baraza la kijiji

SEHEMU YA 8: KUFUTWA KWA KIKUNDI / DISSOLUTION
- Kikundi kinaweza kufutwa kwa kura ya wanachama 3/4
- Mali itagawanywa kwa kulingana na hisa za wanachama
"""
