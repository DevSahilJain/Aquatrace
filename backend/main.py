from typing import List

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from scipy.optimize import nnls

app = FastAPI(
    title="AquaTrace API",
    description="Simulated water leak detection and localisation",
    version="1.0.0",
)

# CORS for local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Each row represents a sensor; each column represents a possible leak.
# These signatures are illustrative for a simulated five-pipe network.
# H[sensor, pipe] = 1 if a leak in that pipe affects that sensor, else 0.
# Units: litres per second (L/s) for flows and leak rates.
H = np.array([
    [1, 1, 1, 1, 1],
    [0, 1, 0, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1],
], dtype=float)

PIPE_NAMES = ["P1", "P2", "P3", "P4", "P5"]


class LeakRequest(BaseModel):
    baseline: List[float] = Field(
        ..., min_length=5, max_length=5,
        description="Expected flow at each of five sensors",
    )
    observed: List[float] = Field(
        ..., min_length=5, max_length=5,
        description="Measured flow at each of five sensors",
    )


class SimulateRequest(BaseModel):
    baseline: List[float] = Field(
        ..., min_length=5, max_length=5,
        description="Expected (baseline) flow at each of five sensors in L/s",
    )
    observed: List[float] = Field(
        ..., min_length=5, max_length=5,
        description="Measured (actual) flow at each of five sensors in L/s",
    )
    sensor_noise: List[float] = Field(
        ..., min_length=5, max_length=5,
        description="Sensor noise standard deviation at each sensor in L/s (not used in estimation; for documentation)",
    )


@app.get("/")
def home():
    return {
        "message": "AquaTrace API is running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok", "project": "AquaTrace"}


@app.post("/api/simulate")
def simulate_leaks(request: SimulateRequest):
    """
    Simulated leak estimation for a five-pipe network.

    Mathematical model:
    - Let H (5x5) be the leak-signature matrix where H[i,j] = 1 if a leak in pipe j
      contributes to the flow deficit at sensor i, else 0.
    - Let b (5,) be the baseline flow vector at the five sensors (L/s).
    - Let o (5,) be the observed flow vector at the five sensors (L/s).
    - The flow deficit vector d = max(b - o, 0) represents positive residuals (L/s).
    - We estimate non-negative leak rates x (5,) by solving the non-negative
      least squares problem: minimize ||H x - d||^2 subject to x >= 0.
    - The solution uses scipy.optimize.nnls.

    This is a simulated model. Results are estimates, not confirmation of real leaks.
    """
    baseline = np.asarray(request.baseline, dtype=float)
    observed = np.asarray(request.observed, dtype=float)
    sensor_noise = np.asarray(request.sensor_noise, dtype=float)  # documented, not used in estimation

    # Validate inputs
    for name, arr in [("baseline", baseline), ("observed", observed), ("sensor_noise", sensor_noise)]:
        if not np.all(np.isfinite(arr)):
            raise HTTPException(
                status_code=422,
                detail=f"All {name} values must be finite numbers.",
            )
        if np.any(arr < 0):
            raise HTTPException(
                status_code=422,
                detail=f"{name} values cannot be negative.",
            )

    # Flow deficit vector: positive residuals only (L/s)
    deficit = np.maximum(baseline - observed, 0)

    # Estimate non-negative leak rates using NNLS
    leak_rates, residual_norm = nnls(H, deficit)

    total_estimated_leakage = float(np.sum(leak_rates))

    return {
        "baseline_flows": baseline.tolist(),
        "observed_flows": observed.tolist(),
        "deficits": deficit.tolist(),
        "estimated_leak_rates": [
            {
                "pipe": PIPE_NAMES[i],
                "estimated_rate_lps": round(float(leak_rates[i]), 3),
            }
            for i in range(len(PIPE_NAMES))
        ],
        "total_estimated_leakage_lps": round(total_estimated_leakage, 3),
        "residual_norm": round(float(residual_norm), 3),
        "warning": (
            "Results are simulated estimates from an illustrative network model; "
            "they do not confirm real-world leaks."
        ),
        "model_note": (
            "Leak-signature matrix H (5 sensors x 5 pipes): H[i,j]=1 means pipe j leak "
            "affects sensor i. Deficit = max(baseline - observed, 0). "
            "Estimation: min ||H x - deficit||^2 s.t. x >= 0 via scipy.optimize.nnls. "
            "Units: litres per second (L/s). Sensor noise is documented but not used in estimation."
        ),
    }


@app.post("/analyze")
def analyze_leaks(request: LeakRequest):
    baseline = np.asarray(request.baseline, dtype=float)
    observed = np.asarray(request.observed, dtype=float)

    if not np.all(np.isfinite(baseline)) or not np.all(np.isfinite(observed)):
        raise HTTPException(
            status_code=422,
            detail="All flow values must be finite numbers.",
        )

    if np.any(baseline < 0) or np.any(observed < 0):
        raise HTTPException(
            status_code=422,
            detail="Flow values cannot be negative.",
        )

    # Positive residuals indicate a flow deficit.
    residual = np.maximum(baseline - observed, 0)

    # Estimate non-negative leak rates using least squares.
    leak_rates, residual_norm = nnls(H, residual)

    return {
        "sensor_deficits": residual.tolist(),
        "estimated_leaks": [
            {
                "pipe": PIPE_NAMES[i],
                "estimated_rate": round(float(leak_rates[i]), 3),
            }
            for i in range(len(PIPE_NAMES))
        ],
        "residual_norm": round(float(residual_norm), 3),
        "note": (
            "Estimates use an illustrative simulated network model; "
            "they are not confirmation of real-world leaks."
        ),
    }