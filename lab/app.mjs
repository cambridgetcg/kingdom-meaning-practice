import {
  BOUNDARIES,
  DEFAULT_STATE,
  LAB_VERSION,
  LINEAGE_SHA256,
  evaluate,
  karmaTrace,
} from "./engine.mjs";

const controls = [...document.querySelectorAll("input[type=range]")];
const output = {
  rateA: document.querySelector("[data-output=rate-a]"),
  rateB: document.querySelector("[data-output=rate-b]"),
  arrivalA: document.querySelector("[data-output=arrival-a]"),
  arrivalB: document.querySelector("[data-output=arrival-b]"),
  reachSummary: document.querySelector("[data-output=reach-summary]"),
  gain: document.querySelector("[data-output=gain]"),
  loss: document.querySelector("[data-output=loss]"),
  final: document.querySelector("[data-output=final]"),
  feedbackSummary: document.querySelector("[data-output=feedback-summary]"),
};
const reachPlot = document.querySelector("[data-plot=reach]");
const feedbackPlot = document.querySelector("[data-plot=feedback]");
const traceOutput = document.querySelector("[data-output=karma-trace]");
const prediction = document.querySelector("#prediction");
const change = document.querySelector("#change-note");

let current;

function clearTrace() {
  traceOutput.textContent = "";
  traceOutput.hidden = true;
}

function readState() {
  return Object.fromEntries(controls.map((control) => [control.name, control.value]));
}

function format(value, digits = 3) {
  return Number(value).toFixed(digits);
}

function rateFormat(value) {
  return value < 0.0001 ? value.toExponential(2) : format(value, 5);
}

function fluxFormat(value) {
  return value !== 0 && Math.abs(value) < 0.001
    ? value.toExponential(3)
    : format(value, 4);
}

function percent(value) {
  const percentage = value * 100;
  return percentage > 0 && percentage < 0.01
    ? `${percentage.toExponential(2)}%`
    : percentage < 100 && percentage > 99.99
      ? `${format(percentage, 7)}%`
    : `${format(percentage, 1)}%`;
}

function linePath(points, width, height, maximum) {
  return points.map((point, index) => {
    const x = 10 + (point.t / 10) * (width - 20);
    const y = height - 10 - (point.value / maximum) * (height - 20);
    return `${index === 0 ? "M" : "L"}${format(x, 2)} ${format(y, 2)}`;
  }).join(" ");
}

function drawReach(result) {
  const width = 520;
  const height = 220;
  const series = [
    { key: "A", rate: result.reach.rateA, color: "#4ea78b", dash: "" },
    { key: "B", rate: result.reach.rateB, color: "#dfaa55", dash: "10 7" },
  ];
  const paths = series.map((item) => {
    const points = Array.from({ length: 41 }, (_, index) => {
      const t = index / 4;
      return { t, value: 1 - Math.exp(-item.rate * t) };
    });
    const endpoint = points.at(-1).value;
    const endpointY = height - 10 - endpoint * (height - 20);
    const labelY = Math.min(height - 14, Math.max(18, endpointY + (item.key === "A" ? -9 : 15)));
    return `<path d="${linePath(points, width, height, 1)}" stroke="${item.color}" stroke-dasharray="${item.dash}" />
      <text class="series-label" x="442" y="${format(labelY, 2)}">${item.key} · ${item.key === "A" ? "solid" : "dashed"}</text>`;
  }).join("");
  reachPlot.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="reach-plot-title reach-plot-desc">
      <title id="reach-plot-title">Finite-time arrival probability</title>
      <desc id="reach-plot-desc">Two separate constant-hazard cumulative arrival curves over ten scaled time units. Route A is solid and route B is dashed.</desc>
      <path class="axis" d="M10 10V210H510" />
      ${paths}
      <text x="16" y="25">arrival probability</text>
      <text x="410" y="202">time →</text>
    </svg>`;
}

function drawFeedback(result) {
  const width = 520;
  const height = 220;
  const maximum = result.state.capacity;
  feedbackPlot.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="feedback-plot-title feedback-plot-desc">
      <title id="feedback-plot-title">Toy gain-loss trajectory</title>
      <desc id="feedback-plot-desc">One bounded product-state trajectory over ten dimensionless time units.</desc>
      <path class="axis" d="M10 10V210H510" />
      <path d="${linePath(result.feedback.points, width, height, maximum)}" stroke="#83b6d1" />
      <text x="16" y="25">product state</text>
      <text x="410" y="202">time →</text>
    </svg>`;
}

function render() {
  current = evaluate(readState());
  const initialControl = document.querySelector("#initial");
  initialControl.max = String(Math.min(0.5, current.state.capacity));
  for (const control of controls) {
    control.value = String(current.state[control.name]);
    const label = document.querySelector(`[data-value=${control.name}]`);
    if (label) label.textContent = format(current.state[control.name], 2);
  }

  output.rateA.textContent = rateFormat(current.reach.rateA);
  output.rateB.textContent = rateFormat(current.reach.rateB);
  output.arrivalA.textContent = percent(current.reach.arrivalA);
  output.arrivalB.textContent = percent(current.reach.arrivalB);
  const thresholdNote = current.reach.belowDisplayThreshold.length === 2
    ? "Both routes fall below the arbitrary 5% display marker in this window."
    : current.reach.belowDisplayThreshold.length === 1
      ? `Route ${current.reach.belowDisplayThreshold[0]} falls below the arbitrary 5% display marker in this window.`
      : "Neither route falls below the arbitrary 5% display marker in this window.";
  const comparisonNote = current.reach.comparison === "tie"
    ? "The two separate routes have equal toy rates."
    : `Route ${current.reach.comparison} has the greater toy rate.`;
  output.reachSummary.textContent = `${comparisonNote} ${thresholdNote} A nonzero chance is never labelled impossible.`;

  output.gain.textContent = fluxFormat(current.feedback.initialGain);
  output.loss.textContent = fluxFormat(current.feedback.initialLoss);
  output.final.textContent = fluxFormat(current.feedback.final);
  output.feedbackSummary.textContent = current.feedback.trajectoryChange === "unchanged"
    ? current.feedback.initial === 0
      ? "The state stayed unchanged in this window: with no initial product state, this feedback term has nothing to amplify."
      : "The state stayed unchanged at the displayed precision in this finite window."
    : current.feedback.trajectoryChange === "growth"
      ? `At the chosen initial state, gain exceeds loss and the analytic trajectory rises toward a bounded level near ${format(current.feedback.equilibrium, 3)}.`
      : "At the chosen initial state, loss exceeds gain and the analytic trajectory recedes in this toy window.";

  drawReach(current);
  drawFeedback(current);
  clearTrace();
}

function reset() {
  for (const control of controls) {
    control.value = DEFAULT_STATE[control.name];
  }
  prediction.value = "unstated";
  change.value = "";
  render();
}

function renderTrace() {
  const trace = karmaTrace({
    expectationReport: prediction.value,
    changeReport: change.value.trim() || "No change report supplied.",
    state: current.state,
    reach: current.reach,
    feedback: current.feedback,
  });
  traceOutput.textContent = JSON.stringify({
    schema: "kingdom.karma-teaching-trace/0.2",
    lab: LAB_VERSION,
    sourceLineageSha256: LINEAGE_SHA256,
    relationship: BOUNDARIES.relationship,
    mechanismTransferred: BOUNDARIES.mechanismTransferred,
    ...trace,
  }, null, 2);
  traceOutput.hidden = false;
  traceOutput.focus();
}

for (const control of controls) control.addEventListener("input", render);
prediction.addEventListener("change", clearTrace);
change.addEventListener("input", clearTrace);
document.querySelector("#reset-lab").addEventListener("click", reset);
document.querySelector("#make-trace").addEventListener("click", renderTrace);

render();
