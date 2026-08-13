export const LAB_VERSION = "folding-feedback-field-lab/0.2";
export const LINEAGE_SHA256 =
  "c07c2c9d02c2a3163ac595c339c770450900ad9397a8e42b578f269c65599f4b";

const HORIZON = 10;
const SAMPLE_STEP = 0.25;
const DISPLAY_THRESHOLD = 0.05;
const PRECISION = 6;

export const DEFAULT_STATE = Object.freeze({
  barrierA: 4.8,
  barrierB: 7.2,
  prefactorA: 1,
  prefactorB: 1,
  growth: 0.62,
  capacity: 1,
  loss: 0.18,
  initial: 0.03,
});

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function finiteNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function round(value, precision = PRECISION) {
  return Number(value.toFixed(precision));
}

export function normalizeState(input = {}) {
  const state = {
    barrierA: clamp(finiteNumber(input.barrierA, DEFAULT_STATE.barrierA), 0, 12),
    barrierB: clamp(finiteNumber(input.barrierB, DEFAULT_STATE.barrierB), 0, 12),
    prefactorA: clamp(finiteNumber(input.prefactorA, DEFAULT_STATE.prefactorA), 0.05, 2),
    prefactorB: clamp(finiteNumber(input.prefactorB, DEFAULT_STATE.prefactorB), 0.05, 2),
    growth: clamp(finiteNumber(input.growth, DEFAULT_STATE.growth), 0, 1.2),
    capacity: clamp(finiteNumber(input.capacity, DEFAULT_STATE.capacity), 0.2, 2),
    loss: clamp(finiteNumber(input.loss, DEFAULT_STATE.loss), 0, 1.2),
    initial: clamp(finiteNumber(input.initial, DEFAULT_STATE.initial), 0, 0.5),
  };
  state.initial = Math.min(state.initial, state.capacity);
  return state;
}

export function activatedRate(barrier, prefactor = 1) {
  return prefactor * Math.exp(-barrier);
}

export function firstArrivalProbability(rate, horizon = HORIZON) {
  return 1 - Math.exp(-Math.max(0, rate) * Math.max(0, horizon));
}

export function reachability(state) {
  const rateA = activatedRate(state.barrierA, state.prefactorA);
  const rateB = activatedRate(state.barrierB, state.prefactorB);
  const arrivalA = firstArrivalProbability(rateA);
  const arrivalB = firstArrivalProbability(rateB);
  const tolerance = 1e-12 * Math.max(1, Math.abs(rateA), Math.abs(rateB));
  const comparison = Math.abs(rateA - rateB) <= tolerance
    ? "tie"
    : rateA > rateB ? "A" : "B";
  const belowDisplayThreshold = [
    ...(arrivalA < DISPLAY_THRESHOLD ? ["A"] : []),
    ...(arrivalB < DISPLAY_THRESHOLD ? ["B"] : []),
  ];
  return {
    rateA,
    rateB,
    arrivalA,
    arrivalB,
    comparison,
    belowDisplayThreshold,
    displayThreshold: DISPLAY_THRESHOLD,
    horizon: HORIZON,
    assumption: "separate constant-hazard exponential waiting-time routes",
  };
}

function gainFlux(value, state) {
  return state.growth * value * (1 - value / state.capacity);
}

function lossFlux(value, state) {
  return state.loss * value;
}

function feedbackValue(time, state) {
  if (state.initial === 0) return 0;
  const linearRate = state.growth - state.loss;
  const quadraticRate = state.growth / state.capacity;
  if (Math.abs(linearRate) <= 1e-12) {
    return state.initial / (1 + quadraticRate * state.initial * time);
  }
  const exponential = Math.exp(linearRate * time);
  return state.initial * exponential
    / (1 + (quadraticRate * state.initial / linearRate) * (exponential - 1));
}

export function feedbackTrajectory(state, horizon = HORIZON, sampleStep = SAMPLE_STEP) {
  const steps = Math.ceil(horizon / sampleStep);
  const points = Array.from({ length: steps + 1 }, (_, index) => {
    const time = Math.min(horizon, index * sampleStep);
    return { t: round(time), value: feedbackValue(time, state) };
  });

  const initialGain = gainFlux(state.initial, state);
  const initialLoss = lossFlux(state.initial, state);
  const initialDifference = initialGain - initialLoss;
  const lowDensityPerCapitaRate = state.growth - state.loss;
  const equilibriumKind = state.growth === 0 && state.loss === 0
    ? "continuum"
    : state.growth > state.loss ? "zero-and-positive" : "zero-only";
  const equilibrium = equilibriumKind === "zero-and-positive"
    ? state.capacity * (1 - state.loss / state.growth)
    : equilibriumKind === "zero-only" ? 0 : null;
  const trajectoryChange = initialDifference > 1e-12
    ? "growth"
    : initialDifference < -1e-12 ? "decline" : "unchanged";

  return {
    points,
    initial: state.initial,
    initialGain,
    initialLoss,
    lowDensityPerCapitaRate,
    equilibrium: equilibrium === null ? null : clamp(equilibrium, 0, state.capacity),
    equilibriumKind,
    final: points.at(-1).value,
    initialFluxComparison: initialDifference > 1e-12
      ? "gain-above-loss"
      : initialDifference < -1e-12 ? "loss-above-gain" : "balanced",
    trajectoryChange,
    solution: "analytic logistic gain with linear loss",
    sampleStep,
  };
}

export function karmaTrace({ expectationReport, changeReport, state, reach, feedback }) {
  const allowedExpectations = [
    "unstated",
    "a-more-reachable",
    "b-more-reachable",
    "growth",
    "decline",
  ];
  const expectation = allowedExpectations.includes(expectationReport)
    ? expectationReport
    : "unstated";
  const productChange = feedback.trajectoryChange === "growth"
    ? "grew"
    : feedback.trajectoryChange === "decline" ? "declined" : "stayed unchanged";
  const reachComparison = reach.comparison === "tie"
    ? "Routes A and B had equal finite-horizon reachability."
    : `Route ${reach.comparison} had greater finite-horizon reachability.`;
  const computedOutput = [
    reachComparison,
    `The toy product state ${productChange} during the finite window.`,
  ];
  const agreement = expectation === "unstated"
    ? null
    : expectation === "a-more-reachable"
      ? reach.comparison === "A"
      : expectation === "b-more-reachable"
        ? reach.comparison === "B"
        : expectation === "growth"
          ? feedback.trajectoryChange === "growth"
          : feedback.trajectoryChange === "decline";

  return {
    expectationReport: {
      value: expectation,
      orderVerified: false,
    },
    changeReport: {
      text: changeReport,
      actionVerified: false,
      countVerified: false,
    },
    computedOutput,
    evidence: {
      kind: "computed-model-output",
      modelVersion: LAB_VERSION,
      effectiveState: { ...state },
      assumptions: {
        arrival: reach.assumption,
        feedback: feedback.solution,
      },
      horizon: reach.horizon,
      rateA: reach.rateA,
      rateB: reach.rateB,
      arrivalA: reach.arrivalA,
      arrivalB: reach.arrivalB,
      displayThreshold: reach.displayThreshold,
      initialGain: feedback.initialGain,
      initialLoss: feedback.initialLoss,
      final: feedback.final,
      feedbackSampleStep: feedback.sampleStep,
    },
    causalAttribution: "not-assessed",
    agreementWithCurrentComputation: agreement,
    response: agreement === null
      ? "No expectation was reported. Keep the computed result without rewriting it as foresight."
      : agreement
        ? "The reported expectation agrees with the current toy computation. Its timing is not verified, and this does not validate a scientific mechanism."
        : "The reported expectation disagrees with the current toy computation. Its timing is not verified; revise the model or expectation, not the record.",
    freshTurnBoundary: "A further change is a fresh turn; this trace starts nothing automatically.",
  };
}

export function evaluate(input = {}) {
  const state = normalizeState(input);
  const reach = reachability(state);
  const feedback = feedbackTrajectory(state);
  return { state, reach, feedback };
}

export const BOUNDARIES = Object.freeze({
  relationship: "analogy",
  mechanismTransferred: false,
  units: "nondimensionalized teaching units",
  claims: [
    "The engine compares finite-time reachability; it does not calculate preference or stability.",
    "This toy calls its gain branch positively reinforcing only where that gain flux increases with the product state.",
    "Gain, loss, saturation, and finite observation time can change the visible result.",
  ],
  claimsNotMade: [
    "a physical free-energy calculation",
    "a crystal-growth model",
    "a protein-folding simulation",
    "an amyloid or prion kinetic model",
    "a medical, laboratory, or manufacturing inference",
    "proof of intention or design in nature",
    "KARMA as a force, reward, score, or automatic loop",
  ],
});
