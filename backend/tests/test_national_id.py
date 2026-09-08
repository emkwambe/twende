"""National ID normalisation, validation and redaction — Sprint 15 Phase 1.

Two properties are under test, and they pull in opposite directions:

  **Be generous on input.** The previous rule demanded a grouping the card does
  not use, so a holder copying their own number verbatim was told it was invalid.
  Every reasonable rendering must be accepted.

  **Be silent on output.** The number must not reach a log, a repr, an exception
  or a Sentry payload. Those tests assert absence, which is the harder thing to
  be confident about — so they use a sentinel and search the actual captured
  output rather than trusting the implementation.
"""
import io
import logging
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from national_id import (  # noqa: E402
    NationalId,
    format_nida,
    normalize_nid,
    validate_nida,
)
from observability import (  # noqa: E402
    RedactingFilter,
    redact_ids,
    scrub_event,
    sentry_options,
)

# Synthetic throughout: ward 99999 and check digits 00 do not occur in issued
# numbers. Digits are identical across the three groupings.
CARD = "19900101-99999-00000-00"      # as printed on the card, 8-5-5-2
LEGACY = "1990-0101-99999-00000-00"   # the grouping the repo used to demand
BARE = "19900101999990000000"
DIGITS = BARE


class TestAcceptsEveryGrouping:
    @pytest.mark.parametrize("value", [CARD, LEGACY, BARE])
    def test_all_groupings_valid(self, value):
        assert validate_nida(value).valid

    @pytest.mark.parametrize("value", [CARD, LEGACY, BARE])
    def test_all_groupings_normalise_identically(self, value):
        assert validate_nida(value).digits == DIGITS

    def test_card_grouping_was_the_regression(self):
        """The old rule was ^\\d{4}-\\d{4}-\\d{5}-\\d{5}-\\d{2}$, which rejects this."""
        import re

        assert not re.match(r"^\d{4}-\d{4}-\d{5}-\d{5}-\d{2}$", CARD)
        assert validate_nida(CARD).valid

    def test_canonical_output_is_the_card_grouping(self):
        assert format_nida(BARE) == CARD


class TestNormalisation:
    @pytest.mark.parametrize(
        "messy",
        [
            "19900101 99999 00000 00",       # spaces
            " 19900101-99999-00000-00 ",     # padding
            "+19900101999990000000",         # feature-phone habit
            "19900101/99999/00000/00",       # slashes
            "19900101.99999.00000.00",       # dots
            "‏19900101-99999-00000-00‎",  # RTL marks
            "19900101​-99999-00000-00",  # zero-width space (paste artefact)
            "19900101 -99999-00000-00",  # non-breaking space
        ],
    )
    def test_survives_real_world_input(self, messy):
        assert validate_nida(messy).digits == DIGITS

    @pytest.mark.parametrize(
        "typed,expected_char",
        [("O", "0"), ("o", "0"), ("I", "1"), ("l", "1"), ("S", "5"), ("B", "8")],
    )
    def test_confusables_are_mapped_not_rejected(self, typed, expected_char):
        """In a numeric-only field these are unambiguous. A user reading O off a
        card and typing the letter made a legible mistake, not an invalid claim.

        The substitution is made in the ward block, not the leading date: mutating
        position 1 changes the birth year and would fail the date check for an
        unrelated reason.
        """
        typed_value = BARE[:8] + typed + BARE[9:]
        expected = BARE[:8] + expected_char + BARE[9:]
        assert validate_nida(typed_value).digits == expected

    def test_normalisations_are_reported(self):
        """A spike in O->0 is a UX signal; clean input arriving fast is a security
        signal. Neither is visible unless the fixes are recorded."""
        result = normalize_nid("199OO1O1-99999-OOOOO-OO")
        assert result.changed
        assert any(a.startswith("confusable:O->0") for a in result.applied)

    def test_clean_input_records_nothing(self):
        assert not normalize_nid(BARE).changed


class TestValidationLimits:
    """What is checked, and — as importantly — what is not."""

    @pytest.mark.parametrize(
        "value,fragment",
        [
            ("1990010199999000000", "expected 20 digits"),
            ("199001019999900000000", "expected 20 digits"),
            ("19901301-99999-00000-00", "not a real date"),
            ("19900230-99999-00000-00", "not a real date"),
            ("20200101-99999-00000-00", "at least 18"),
            ("20990101-99999-00000-00", "future"),
            ("1990010199999000000X", "non-digits"),
        ],
    )
    def test_rejects_with_an_actionable_reason(self, value, fragment):
        result = validate_nida(value)
        assert not result.valid
        assert any(fragment in e for e in result.errors), result.errors

    def test_no_checksum_is_implemented(self):
        """No public check-digit algorithm exists for the NIN — not from NIDA, and
        python-stdnum carries no Tanzania module at all. Inventing one would
        silently reject real citizens, so mutating the trailing pair must still
        validate. This test exists to fail loudly if someone adds a checksum."""
        for tail in ("00", "17", "42", "99"):
            assert validate_nida(BARE[:-2] + tail).valid

    def test_empty_input_is_not_an_error(self):
        assert validate_nida(None).valid is False
        assert validate_nida("").valid is False


class TestRedaction:
    def test_every_string_conversion_is_redacted(self):
        nid = NationalId(CARD)
        for rendered in (repr(nid), str(nid), f"{nid}", format(nid), "%s" % nid):
            assert DIGITS not in rendered
            assert CARD not in rendered
            assert rendered.endswith("(****0000)")

    def test_reveal_is_the_only_way_out(self):
        assert NationalId(CARD).reveal() == DIGITS

    def test_invalid_cannot_be_constructed(self):
        with pytest.raises(ValueError):
            NationalId("123")

    def test_survives_container_interpolation(self):
        """The dataclass/dict repr path — a common accidental leak."""
        assert DIGITS not in str({"nid": NationalId(CARD)})
        assert DIGITS not in repr([NationalId(CARD)])


class TestLogRedactionBackstop:
    """For strings that never passed through NationalId — third-party output,
    raw request bodies, a stray print. A denylist, and a backstop only."""

    @pytest.fixture
    def captured(self):
        buf = io.StringIO()
        handler = logging.StreamHandler(buf)
        handler.addFilter(RedactingFilter())
        logger = logging.getLogger("test_redaction")
        logger.handlers = [handler]
        logger.setLevel(logging.INFO)
        logger.propagate = False
        return logger, buf

    def test_deferred_args_are_scrubbed(self, captured):
        """logger.info("id=%s", value) formats late — scrubbing only msg misses it."""
        logger, buf = captured
        logger.info("member id=%s", CARD)
        assert CARD not in buf.getvalue()

    def test_preformatted_message_is_scrubbed(self, captured):
        logger, buf = captured
        logger.info(f"member id={CARD}")
        assert CARD not in buf.getvalue()

    @pytest.mark.parametrize("value", [CARD, LEGACY, BARE, "123-456-789"])
    def test_all_shapes_including_tin(self, value):
        assert value not in redact_ids(f"payload {value} end")


class TestSentryOptions:
    def test_local_variables_are_off(self):
        """The default-on setting that leaks raw values through stack frames: any
        raise below the parser ships the number inside frames[].vars."""
        assert sentry_options("https://k@example.com/1")["include_local_variables"] is False

    def test_default_pii_is_off(self):
        assert sentry_options("https://k@example.com/1")["send_default_pii"] is False

    def test_frame_vars_are_scrubbed_in_process(self):
        event = {
            "exception": {
                "values": [{"stacktrace": {"frames": [{"vars": {"nid": CARD}}]}}]
            }
        }
        assert CARD not in str(scrub_event(event, {}))

    def test_breadcrumbs_and_request_are_scrubbed(self):
        event = {
            "request": {"data": {"national_id": CARD}},
            "breadcrumbs": [{"message": f"lookup {CARD}"}],
        }
        scrubbed = str(scrub_event(event, {}))
        assert CARD not in scrubbed
