"""KYC tier resolution: what a member has proved, and what that unlocks.

The ladder mirrors BoT's Payment Systems (Electronic Money) Regulations 2015,
Third Schedule Form F, rather than inventing one. Two things follow from that
which are easy to get wrong:

**Tier 2 has two routes.** A verified NIDA, *or* a ward/village executive letter
corroborated by the group's own committee. Form F lists a WEO/VEO letter among
accepted photo ID, so this is not a workaround — a NIDA-only flow would be
stricter than Tanzanian law requires, and would exclude 35-43% of adults,
concentrated in rural women, under-25s and dependants. That is the same cohort
the chama recalibration identified as the primary customer, and excluding them
at enrolment is worse than scoring them unfairly: no fairness audit can see a
person who never got an account.

**Verification expires.** NIDA suspends NIN usage a month after an SMS notice
when a produced card is never collected — around 1.2 million were uncollected as
of January 2025. A member can hold a valid NIN, be SIM-registered against it, and
still have the credential switched off. "Has NIDA" is never permanent state.

Documents gate *eligibility*; behaviour still sizes the loan. That split is what
keeps the formalization-bias trade-off bounded — see UNDERWRITING_ENGINE.md.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Optional

from country_packs import get_pack
from models import IdentityAttestation, Member


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _aware(dt: Optional[datetime]) -> Optional[datetime]:
    """SQLite returns naive datetimes; normalise before comparing."""
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


@dataclass
class TierStatus:
    """A member's standing, and — when short — what would actually close the gap."""

    tier: int
    name: str
    can_borrow: bool
    method: Optional[str] = None
    verified_at: Optional[datetime] = None
    reverify_after: Optional[datetime] = None
    expired: bool = False
    limits: dict = field(default_factory=dict)
    # Phrased as instructions, never as a bare refusal.
    next_steps: list[str] = field(default_factory=list)


def resolve_tier(member: Member, db=None) -> TierStatus:
    """Compute the tier a member has actually reached, from evidence on record.

    Deliberately derived rather than trusted: `member.kyc_tier` is a cache, and a
    cached tier that outlives its evidence is how an expired credential keeps
    unlocking credit.
    """
    pack = get_pack(member.country or "TZ")
    now = _now()

    has_id = bool(member.national_id)
    attestation = _accepted_attestation(member, db)
    reverify_after = _aware(member.kyc_reverify_after)
    expired = bool(reverify_after and reverify_after < now)

    # ── Tier 3: business documents on top of Tier 2 ─────────────────────────
    if (has_id or attestation) and not expired and member.tin_number:
        tier, method = 3, member.kyc_method or ("registry" if has_id else "attestation")
    # ── Tier 2: a verified identity by either route ─────────────────────────
    elif (has_id or attestation) and not expired:
        tier = 2
        method = member.kyc_method or ("registry" if has_id else "attestation")
    # ── Tier 1: some accepted document, but not verified (or lapsed) ────────
    elif has_id or attestation or member.kyc_tier >= 1:
        tier, method = 1, member.kyc_method
    else:
        tier, method = 0, None

    band = pack.tier_for(tier)
    status = TierStatus(
        tier=tier,
        name=band["name"],
        can_borrow=band["can_borrow"],
        method=method,
        verified_at=_aware(member.kyc_verified_at),
        reverify_after=reverify_after,
        expired=expired,
        limits={
            "max_single_txn": band["max_single_txn"],
            "max_daily": band["max_daily"],
            "max_balance": band["max_balance"],
            "currency": member.currency or pack.CURRENCY,
        },
    )
    status.next_steps = _next_steps(status, member, pack, attestation, expired)
    return status


def _accepted_attestation(member: Member, db) -> Optional[IdentityAttestation]:
    """The member's accepted attestation, if any.

    Uses the loaded relationship when present so this stays usable without a
    session — the underwriting engine is called with detached objects in tests.
    """
    records = None
    if db is not None:
        records = (
            db.query(IdentityAttestation)
            .filter(
                IdentityAttestation.member_id == member.id,
                IdentityAttestation.status == "accepted",
            )
            .all()
        )
    else:
        loaded = getattr(member, "attestations", None) or []
        records = [a for a in loaded if a.status == "accepted"]
    return records[0] if records else None


def _next_steps(
    status: TierStatus, member: Member, pack, attestation, expired: bool
) -> list[str]:
    """What the member should do next, in the order that helps them most.

    Never a bare refusal: a person who cannot borrow needs to know which of two
    routes is open to them, not that they failed a check.
    """
    steps: list[str] = []
    if expired:
        steps.append(
            "Your identity verification has lapsed and needs renewing. "
            "If you registered for a NIDA card but never collected it, collect it "
            "first — NIDA suspends unused numbers."
        )
    if status.tier < 2:
        if not member.national_id and not attestation:
            steps.append(
                "Add a NIDA number to unlock credit."
            )
            steps.append(
                "No NIDA? A letter from your ward or village executive officer, "
                "confirmed by two of your group's officers, works instead."
            )
        elif not attestation and not member.national_id:
            steps.append("Complete identity verification to unlock credit.")
    if status.tier == 2 and not member.tin_number:
        steps.append("Add a TIN and business licence for higher business limits.")
    return steps


def can_borrow(member: Member, db=None) -> tuple[bool, TierStatus]:
    """Whether this member may take a loan, with the reason if not."""
    status = resolve_tier(member, db)
    pack = get_pack(member.country or "TZ")
    return status.tier >= pack.MIN_TIER_TO_BORROW, status


def record_verification(
    member: Member, method: str, pack=None
) -> None:
    """Stamp a successful verification and set when it must be renewed."""
    pack = pack or get_pack(member.country or "TZ")
    if method not in pack.KYC_METHODS:
        raise ValueError(f"unknown verification method {method!r}")
    now = _now()
    member.kyc_method = method
    member.kyc_verified_at = now
    member.kyc_reverify_after = now + timedelta(days=pack.KYC_REVERIFY_DAYS)
    member.kyc_tier = max(member.kyc_tier or 0, 2)


def validate_attestation(
    attestation: IdentityAttestation, officers: list[Member], pack=None
) -> list[str]:
    """Check a committee attestation before it is accepted.

    Every attesting officer must hold a group office *and* be verified in their
    own right — otherwise unverified accounts could vouch each other into credit,
    which is the obvious attack on this route.
    """
    pack = pack or get_pack("TZ")
    errors: list[str] = []

    if len(officers) < pack.ATTESTATION_MIN_OFFICERS:
        errors.append(
            f"at least {pack.ATTESTATION_MIN_OFFICERS} group officers must attest; "
            f"got {len(officers)}"
        )

    for officer in officers:
        if str(officer.role or "").lower() not in ("chair", "treasurer", "secretary"):
            errors.append(f"{officer.full_name} is not a group officer")
        elif (officer.kyc_tier or 0) < 2:
            errors.append(
                f"{officer.full_name} must be verified before they can attest for others"
            )
        if officer.id == attestation.member_id:
            errors.append("a member cannot attest for themselves")

    if attestation.officer_title and attestation.officer_title.upper() not in ("WEO", "VEO"):
        errors.append("letter must be from a Ward (WEO) or Village (VEO) Executive Officer")
    if not attestation.officer_name or not attestation.office:
        errors.append("letter must name the issuing officer and their office")

    return errors
