from __future__ import annotations

import json


FORCE_LIMIT = 0.03
STRESS_LIMIT = 0.10
DISPLACEMENT_LIMIT = 0.01

CLEAN_HISTORY = [
    {"step": 0, "energy": -10.0000, "max_force": 0.42, "rms_force": 0.21, "stress": 1.20, "max_displacement": 0.00, "electronic_ok": True, "state": "FM-A"},
    {"step": 1, "energy": -10.1180, "max_force": 0.23, "rms_force": 0.12, "stress": 0.62, "max_displacement": 0.14, "electronic_ok": True, "state": "FM-A"},
    {"step": 2, "energy": -10.1710, "max_force": 0.10, "rms_force": 0.05, "stress": 0.24, "max_displacement": 0.06, "electronic_ok": True, "state": "FM-A"},
    {"step": 3, "energy": -10.1845, "max_force": 0.041, "rms_force": 0.020, "stress": 0.12, "max_displacement": 0.018, "electronic_ok": True, "state": "FM-A"},
    {"step": 4, "energy": -10.1872, "max_force": 0.024, "rms_force": 0.011, "stress": 0.078, "max_displacement": 0.007, "electronic_ok": True, "state": "FM-A"},
    {"step": 5, "energy": -10.1876, "max_force": 0.019, "rms_force": 0.009, "stress": 0.061, "max_displacement": 0.004, "electronic_ok": True, "state": "FM-A"},
]

STATE_SWITCH_HISTORY = [
    {"step": 0, "energy": -9.8000, "max_force": 0.35, "rms_force": 0.18, "stress": 0.90, "max_displacement": 0.00, "electronic_ok": True, "state": "AFM-B"},
    {"step": 1, "energy": -9.9300, "max_force": 0.18, "rms_force": 0.09, "stress": 0.44, "max_displacement": 0.11, "electronic_ok": True, "state": "AFM-B"},
    {"step": 2, "energy": -10.0900, "max_force": 0.09, "rms_force": 0.04, "stress": 0.20, "max_displacement": 0.05, "electronic_ok": True, "state": "FM-A"},
    {"step": 3, "energy": -10.1600, "max_force": 0.040, "rms_force": 0.019, "stress": 0.11, "max_displacement": 0.016, "electronic_ok": True, "state": "FM-A"},
    {"step": 4, "energy": -10.1800, "max_force": 0.021, "rms_force": 0.010, "stress": 0.072, "max_displacement": 0.006, "electronic_ok": True, "state": "FM-A"},
]


def analyse_branch(history: list[dict[str, object]]) -> dict[str, object]:
    states = [str(row["state"]) for row in history]
    state_switch_steps = [
        int(history[index]["step"])
        for index in range(1, len(history))
        if states[index] != states[index - 1]
    ]
    final = history[-1]
    electronic_complete = all(bool(row["electronic_ok"]) for row in history)
    final_active_criteria = (
        float(final["max_force"]) <= FORCE_LIMIT
        and abs(float(final["stress"])) <= STRESS_LIMIT
        and float(final["max_displacement"]) <= DISPLACEMENT_LIMIT
    )
    tail = history[-2:]
    stable_tail = all(
        float(row["max_force"]) <= FORCE_LIMIT
        and abs(float(row["stress"])) <= STRESS_LIMIT
        and float(row["max_displacement"]) <= DISPLACEMENT_LIMIT
        for row in tail
    )
    accepted = electronic_complete and final_active_criteria and stable_tail and not state_switch_steps
    return {
        "steps": len(history),
        "initial_state": states[0],
        "final_state": states[-1],
        "state_switch_steps": state_switch_steps,
        "electronic_complete": electronic_complete,
        "final_active_criteria": final_active_criteria,
        "stable_two_step_tail": stable_tail,
        "accepted_as_one_continuous_branch": accepted,
        "final_energy": final["energy"],
        "final_max_force": final["max_force"],
        "final_stress": final["stress"],
        "final_max_displacement": final["max_displacement"],
    }


def analyse_history() -> dict[str, object]:
    clean = analyse_branch(CLEAN_HISTORY)
    switched = analyse_branch(STATE_SWITCH_HISTORY)
    assert clean["accepted_as_one_continuous_branch"] is True
    assert clean["state_switch_steps"] == []
    assert switched["accepted_as_one_continuous_branch"] is False
    assert switched["state_switch_steps"] == [2]
    return {
        "fixture_limits": {
            "max_force": FORCE_LIMIT,
            "stress": STRESS_LIMIT,
            "max_displacement": DISPLACEMENT_LIMIT,
        },
        "accepted_branch": clean,
        "state_switches": switched,
        "boundary": (
            "deterministic synthetic histories only; no calculated force, stress, "
            "electronic state, transferable threshold, or structural-minimum claim"
        ),
    }


def run() -> dict[str, object]:
    return analyse_history()


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
