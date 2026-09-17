from pathlib import Path

from argos.pack import Pack, load_case_modules

from e2e_pack.env import OFFICE, apply


def pack() -> Pack:
    here = Path(__file__).resolve().parent
    return Pack(
        id="argos-dash",
        title="argos-dash",
        envs=(OFFICE,),
        apply_env=apply,
        load_cases=lambda: load_case_modules("e2e_pack.cases", here / "cases"),
    )
