"""Keep identity numbers out of logs, traces and error reports.

Encryption at rest is worthless if the plaintext is sitting in a Sentry event, an
nginx access log and an APM trace. In practice that is where this class of data
actually leaks — not from the database.

The controls here are layered, and the order matters:

1. **The `NationalId` type** (`national_id.py`) is the primary defence. It cannot
   print itself, so the dominant leak paths — an f-string in a log line, an
   exception repr, a dataclass repr, a JSON dump of a model — are closed by
   construction rather than by a pattern that has to keep up.
2. **The filter below** is a backstop for strings that never passed through that
   type: third-party library output, raw request bodies, a colleague's `print`.
   It is a denylist and denylists always miss cases — never rely on it alone.
3. **`configure_sentry`** covers the setting most teams miss, documented below.

Deployment controls that are not code and are easy to forget:

    # PostgreSQL — otherwise slow-query and error logging print bound parameters
    log_statement = 'none'
    log_parameter_max_length = 0
    log_parameter_max_length_on_error = 0
    auto_explain.log_parameter_max_length = 0

    # Never put an identity number in a URL path or query string. It lands in
    # access logs, browser history, Referer headers and CDN logs — all outside
    # any encryption boundary. POST body only.
"""
from __future__ import annotations

import logging
import re
from typing import Any, Callable, Optional

# Identity-shaped runs, in every grouping the input layer accepts. Ordered
# longest-first so a formatted number is not partly matched by the bare rule.
_ID_PATTERNS = [
    re.compile(r"(?<!\d)\d{8}-\d{5}-\d{5}-\d{2}(?!\d)"),        # card 8-5-5-2
    re.compile(r"(?<!\d)\d{4}-\d{4}-\d{5}-\d{5}-\d{2}(?!\d)"),  # historical
    re.compile(r"(?<!\d)\d{20}(?!\d)"),                          # bare 20
    re.compile(r"(?<!\d)\d{3}-\d{3}-\d{3}(?!\d)"),               # TIN
]

REDACTED = "[redacted-id]"


def redact_ids(text: str) -> str:
    """Replace identity-shaped runs in free text.

    The bare-20 rule will also hit timestamps, snowflake ids and trace ids. That
    is an accepted cost: redacting a trace id in a log line is cheap, and this is
    a backstop rather than the primary control.
    """
    for pattern in _ID_PATTERNS:
        text = pattern.sub(REDACTED, text)
    return text


class RedactingFilter(logging.Filter):
    """Scrub identity-shaped values from a record before any handler sees it.

    Applied to the record's message *and* its args, because `logger.info("id=%s",
    value)` defers formatting — scrubbing only `record.msg` would miss it entirely.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = redact_ids(record.msg)
        if record.args:
            if isinstance(record.args, dict):
                record.args = {k: self._scrub(v) for k, v in record.args.items()}
            elif isinstance(record.args, tuple):
                record.args = tuple(self._scrub(a) for a in record.args)
        return True

    @staticmethod
    def _scrub(value: Any) -> Any:
        return redact_ids(value) if isinstance(value, str) else value


def install_log_redaction(logger: Optional[logging.Logger] = None) -> None:
    """Attach the filter to every handler on the root logger.

    Filters on a logger do not apply to records propagated from child loggers, so
    this attaches to handlers instead — that catches everything reaching output,
    including third-party libraries.
    """
    root = logger or logging.getLogger()
    redactor = RedactingFilter()
    for handler in root.handlers:
        if not any(isinstance(f, RedactingFilter) for f in handler.filters):
            handler.addFilter(redactor)
    if not root.handlers:  # nothing configured yet; make sure output is covered
        handler = logging.StreamHandler()
        handler.addFilter(redactor)
        root.addHandler(handler)


# ─── Sentry ─────────────────────────────────────────────────────────────────
def scrub_event(event: dict, _hint: dict) -> dict:
    """`before_send` hook: scrub in-process, so the data never leaves the host.

    Server-side scrubbing is a useful second layer, but by then the number has
    already crossed the network to a third party — which under the Tanzanian PDPA
    is a cross-border transfer requiring a permit, not merely a privacy lapse.
    """
    def walk(obj: Any) -> Any:
        if isinstance(obj, str):
            return redact_ids(obj)
        if isinstance(obj, dict):
            return {k: walk(v) for k, v in obj.items()}
        if isinstance(obj, (list, tuple)):
            return type(obj)(walk(v) for v in obj)
        return obj

    for key in ("request", "extra", "contexts", "breadcrumbs", "exception", "message"):
        if key in event:
            event[key] = walk(event[key])
    return event


def sentry_options(dsn: str, environment: str = "development") -> dict:
    """The options that actually matter for PII, ready to pass to `sentry_sdk.init`.

    Kept as a plain dict so it is testable and reviewable without taking a
    dependency the project does not yet have.

    `include_local_variables=False` is the one teams miss. The Python SDK captures
    every stack frame's locals by default, so a `raise` anywhere below the parsing
    code ships the raw number inside
    `exception.values[].stacktrace.frames[].vars` — encrypted database, redacted
    logs, and the number leaves anyway.
    """
    return {
        "dsn": dsn,
        "environment": environment,
        # Do not attach request bodies, headers, cookies or user identifiers.
        "send_default_pii": False,
        # The default-on setting that leaks raw values through stack frames.
        "include_local_variables": False,
        # In-process scrubbing, before anything crosses the network.
        "before_send": scrub_event,
        "before_send_transaction": scrub_event,
        "max_request_body_size": "never",
    }


def configure_sentry(dsn: Optional[str], environment: str = "development") -> bool:
    """Initialise Sentry with PII-safe options if it is installed and configured.

    Returns whether it was initialised. Absent SDK or DSN is not an error — this
    project has no Sentry integration yet, and the point of shipping the options
    now is that the unsafe defaults are never the ones in force.
    """
    if not dsn:
        return False
    try:
        import sentry_sdk  # type: ignore
    except ImportError:
        logging.getLogger(__name__).warning(
            "SENTRY_DSN is set but sentry-sdk is not installed; error reporting is off"
        )
        return False
    sentry_sdk.init(**sentry_options(dsn, environment))
    return True


def configure_observability(
    sentry_dsn: Optional[str] = None,
    environment: str = "development",
    logger_factory: Callable[[], logging.Logger] = logging.getLogger,
) -> None:
    """Install every telemetry control. Call once, at startup, before serving."""
    install_log_redaction(logger_factory())
    configure_sentry(sentry_dsn, environment)
