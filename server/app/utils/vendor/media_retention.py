"""
Shared helpers for existing_media semantics and draft flags.
"""

from __future__ import annotations

import json
from typing import List, Optional, Tuple, Union


def parse_existing_media_ids(raw: Optional[str]) -> Tuple[str, List[int]]:
    """
    Parse the `existing_media` form field.

    Returns (mode, ids):
      - ("keep_all", [])   field omitted / null / empty string
      - ("keep_none", [])  explicit empty JSON list "[]"
      - ("keep_ids", [...]) non-empty list of media row IDs to retain

    CRITICAL: Form(default="[]") made omission identical to "clear all".
    Router must use Form(default=None) for this field.
    """
    if raw is None:
        return ("keep_all", [])

    s = str(raw).strip()
    if s == "" or s.lower() in ("null", "undefined"):
        return ("keep_all", [])

    try:
        parsed = json.loads(s)
    except (json.JSONDecodeError, TypeError):
        return ("keep_all", [])

    if not isinstance(parsed, list):
        return ("keep_all", [])

    if len(parsed) == 0:
        return ("keep_none", [])

    ids: List[int] = []
    for x in parsed:
        try:
            ids.append(int(x))
        except (TypeError, ValueError):
            continue
    return ("keep_ids", ids)


def parse_bool_flag(raw: Optional[Union[str, bool]], default: bool = False) -> bool:
    if raw is None:
        return default
    if isinstance(raw, bool):
        return raw
    s = str(raw).strip().lower()
    if s in ("1", "true", "yes", "on"):
        return True
    if s in ("0", "false", "no", "off", ""):
        return False
    return default


def parse_json_list(raw: Optional[str]) -> list:
    if not raw:
        return []
    try:
        result = json.loads(raw)
        return result if isinstance(result, list) else []
    except (json.JSONDecodeError, TypeError):
        return []