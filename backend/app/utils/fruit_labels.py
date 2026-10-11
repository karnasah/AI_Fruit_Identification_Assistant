"""Helpers for presenting Fruit-360 class labels."""

import re


def clean_fruit_label(label: str) -> str:
    """
    Removes trailing numeric suffixes from Fruit-360 labels.

    Examples:
        Peach Flat 1 -> Peach Flat
        Apple 7 -> Apple
        Grape White 4 -> Grape White
    """
    return re.sub(r"\s+\d+$", "", label)