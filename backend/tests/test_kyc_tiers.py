"""KYC tier ladder and the non-NIDA route — Sprint 15 Phase 2.

The property that matters most here is the one that is easiest to lose in a
refactor: **a member with no NIDA can still reach credit.** Roughly 35-43% of
Tanzanian adults hold no usable NIDA credential, concentrated in rural women,
under-25s and dependants — the same cohort the chama recalibration identified as
the primary customer. A NIDA-only gate would exclude them at enrolment, where no
fairness audit can see it.

That route is lawful, not a workaround: BoT's Payment Systems (Electronic Money)
Regulations 2015, Third Schedule Form F lists "Letter from ward/village
executive" among accepted photo ID.
"""
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path
from uuid import uuid4

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from country_packs import tanzania as tz  # noqa: E402
from kyc import (  # noqa: E402
    can_borrow,
    record_verification,
    resolve_tier,
    validate_attestation,
)
from models import Group, IdentityAttestation, LoanApplication, Member  # noqa: E402
from underwriting import TanzanianUnderwritingEngine  # noqa: E402

SYNTHETIC_NID = "19900101-99999-00000-00"


def make_member(
    *, national_id=None, role="member", kyc_tier=0, tin=None,
    attestations=None, reverify_after=None, method=None,
):
    m = Member(
        id=uuid4(), group_id=uuid4(), country="TZ", currency="TZS",
        full_name="Test Member", phone=f"+2557{uuid4().int % 10**8:08d}",
        national_id=national_id, tin_number=tin,
        savings_balance=Decimal("2000000"), loan_balance=Decimal("0"),
        role=role, kyc_tier=kyc_tier, kyc_method=method,
        kyc_reverify_after=reverify_after,
    )
    m.attestations = attestations or []
    return m


def make_attestation(member_id, officer_ids, status="accepted"):
    return IdentityAttestation(
        id=uuid4(), member_id=member_id, group_id=uuid4(),
        officer_name="A. Mwangosi", officer_title="WEO",
        office="Kariakoo Ward Office", ward="Kariakoo",
        letter_date=datetime.now(timezone.utc),
        attesting_officers=[str(i) for i in officer_ids], status=status,
    )


class TestTierLadder:
    def test_no_evidence_is_tier_zero(self):
        assert resolve_tier(make_member()).tier == 0

    def test_tier_zero_cannot_borrow_but_is_not_locked_out(self):
        status = resolve_tier(make_member())
        assert status.can_borrow is False
        # Tier 0 still permits joining a group and recording contributions.
        assert tz.tier_for(0)["unlocks"]

    def test_nida_reaches_tier_two(self):
        status = resolve_tier(make_member(national_id=SYNTHETIC_NID))
        assert status.tier == 2
        assert status.can_borrow is True
        assert status.method == "registry"

    def test_tin_reaches_tier_three(self):
        status = resolve_tier(make_member(national_id=SYNTHETIC_NID, tin="123-456-789"))
        assert status.tier == 3
        assert status.can_borrow is True

    def test_ladder_mirrors_form_f_ceilings(self):
        """Aligned to the gazetted schedule rather than invented."""
        assert tz.tier_for(1)["max_daily"] == 1_000_000
        assert tz.tier_for(1)["max_balance"] == 2_000_000
        assert tz.tier_for(2)["max_daily"] == 5_000_000


class TestNonNidaRoute:
    """The reason this sprint exists."""

    def test_weo_letter_is_an_accepted_document(self):
        """Form F: 'National ID; or Voter's registration card; or Employment ID;
        or Social Security ID; or Letter from ward/village executive.'"""
        assert "weo_letter" in tz.ACCEPTED_ID_DOCUMENTS

    def test_attestation_reaches_tier_two_without_a_nida(self):
        member = make_member()
        member.attestations = [make_attestation(member.id, [uuid4(), uuid4()])]
        status = resolve_tier(member)
        assert member.national_id is None
        assert status.tier == 2
        assert status.can_borrow is True
        assert status.method == "attestation"

    def test_pending_attestation_does_not_grant_the_tier(self):
        member = make_member()
        member.attestations = [
            make_attestation(member.id, [uuid4(), uuid4()], status="pending")
        ]
        assert resolve_tier(member).tier == 0

    def test_next_steps_offer_both_routes(self):
        """A person who cannot borrow needs to know which routes are open, not
        that they failed a check."""
        steps = " ".join(resolve_tier(make_member()).next_steps).lower()
        assert "nida" in steps
        assert "ward" in steps or "village" in steps


class TestAttestationValidation:
    def _officers(self, n, tier=2, role="treasurer"):
        return [make_member(role=role, kyc_tier=tier, national_id=SYNTHETIC_NID)
                for _ in range(n)]

    def test_requires_two_officers(self):
        officers = self._officers(1)
        att = make_attestation(uuid4(), [o.id for o in officers])
        errors = validate_attestation(att, officers, tz)
        assert any("at least 2" in e for e in errors)

    def test_two_verified_officers_pass(self):
        officers = self._officers(2)
        att = make_attestation(uuid4(), [o.id for o in officers])
        assert validate_attestation(att, officers, tz) == []

    def test_unverified_officers_cannot_vouch(self):
        """Otherwise unverified accounts vouch each other into credit — the
        obvious attack on this route."""
        officers = self._officers(2, tier=0)
        att = make_attestation(uuid4(), [o.id for o in officers])
        errors = validate_attestation(att, officers, tz)
        assert any("must be verified" in e for e in errors)

    def test_ordinary_members_cannot_vouch(self):
        officers = self._officers(2, role="member")
        att = make_attestation(uuid4(), [o.id for o in officers])
        errors = validate_attestation(att, officers, tz)
        assert any("not a group officer" in e for e in errors)

    def test_cannot_attest_for_yourself(self):
        officers = self._officers(2)
        att = make_attestation(officers[0].id, [o.id for o in officers])
        errors = validate_attestation(att, officers, tz)
        assert any("cannot attest for themselves" in e for e in errors)

    def test_letter_must_come_from_a_ward_or_village_officer(self):
        officers = self._officers(2)
        att = make_attestation(uuid4(), [o.id for o in officers])
        att.officer_title = "Chairman"
        errors = validate_attestation(att, officers, tz)
        assert any("Ward (WEO) or Village (VEO)" in e for e in errors)


class TestVerificationExpiry:
    """NIDA suspends NIN usage a month after an SMS notice when a produced card
    is never collected — ~1.2m uncollected as of Jan 2025. A member can hold a
    valid NIN, be SIM-registered against it, and still have it switched off."""

    def test_lapsed_verification_drops_below_borrowing(self):
        member = make_member(
            national_id=SYNTHETIC_NID,
            reverify_after=datetime.now(timezone.utc) - timedelta(days=1),
        )
        status = resolve_tier(member)
        assert status.expired is True
        assert status.can_borrow is False

    def test_lapsed_verification_explains_itself(self):
        member = make_member(
            national_id=SYNTHETIC_NID,
            reverify_after=datetime.now(timezone.utc) - timedelta(days=1),
        )
        steps = " ".join(resolve_tier(member).next_steps).lower()
        assert "lapsed" in steps and "collect" in steps

    def test_record_verification_sets_a_renewal_date(self):
        member = make_member(national_id=SYNTHETIC_NID)
        record_verification(member, "registry", tz)
        assert member.kyc_reverify_after is not None
        assert member.kyc_tier >= 2

    def test_unknown_method_is_rejected(self):
        with pytest.raises(ValueError):
            record_verification(make_member(), "vibes", tz)


class TestUnderwritingGate:
    """The hard reject on `not member.national_id` was the platform's largest
    exclusion mechanism. It is now a tier check."""

    def _loan(self, member):
        group = Group(
            id=member.group_id, name="Nyota", country="TZ", currency="TZS",
            group_type="vicoba", member_count=20,
            total_savings=Decimal("20000000"), interest_rate=Decimal("10"),
        )
        loan = LoanApplication(
            id=uuid4(), member_id=member.id, group_id=group.id, currency="TZS",
            amount=Decimal("500000"), purpose="business", repayment_weeks=12,
            interest_rate=Decimal("10"), total_repayment=Decimal("550000"),
        )
        return group, loan

    def test_tier_zero_is_rejected_with_guidance(self):
        member = make_member()
        group, loan = self._loan(member)
        result = TanzanianUnderwritingEngine.evaluate(member, group, loan)
        assert result["decision"] == "rejected"
        assert result["critical_failures"]
        # The reason must tell them what to do, not merely that they failed.
        assert "nida" in result["critical_failures"][0].lower()

    def test_attestation_verified_member_is_underwritten_normally(self):
        """The acceptance criterion for this phase."""
        member = make_member()
        member.attestations = [make_attestation(member.id, [uuid4(), uuid4()])]
        group, loan = self._loan(member)
        result = TanzanianUnderwritingEngine.evaluate(member, group, loan)
        assert member.national_id is None
        assert not result["critical_failures"]
        assert result["decision"] in {"approved", "flagged", "rejected"}
        assert result["score"] > 0

    def test_documents_still_carry_formalization_points(self):
        """The trade-off is kept but bounded: documents open the door, behaviour
        sizes the loan. An attested member gets no formalization points, which is
        the disparity §7 of the sprint commits to monitoring."""
        attested = make_member()
        attested.attestations = [make_attestation(attested.id, [uuid4(), uuid4()])]
        documented = make_member(national_id=SYNTHETIC_NID)

        g1, l1 = self._loan(attested)
        g2, l2 = self._loan(documented)
        r1 = TanzanianUnderwritingEngine.evaluate(attested, g1, l1)
        r2 = TanzanianUnderwritingEngine.evaluate(documented, g2, l2)

        assert r1["factors"]["formalization_points"] == 0
        assert r2["factors"]["formalization_points"] > 0
        # Both are underwritten; neither is excluded.
        assert not r1["critical_failures"] and not r2["critical_failures"]
