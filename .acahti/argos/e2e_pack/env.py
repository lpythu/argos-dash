import os

OFFICE = "office"

_PRESETS = {
    "office": {
        "ARGOS_DASH_URL": "https://argos.s-aidc.com",
    },
}

_name = OFFICE


def apply(env: str) -> str:
    global _name
    env = (env or "").strip().lower()
    if env not in _PRESETS:
        raise ValueError(f"unknown env {env!r}; use office")
    _name = env
    from argos.secrets import apply_presets, load_secrets

    load_secrets()
    apply_presets(_PRESETS[env])
    return env


def name() -> str:
    return _name


def get(key: str) -> str:
    preset = _PRESETS[_name].get(key, "")
    return os.environ.get(key, preset).rstrip("/")
