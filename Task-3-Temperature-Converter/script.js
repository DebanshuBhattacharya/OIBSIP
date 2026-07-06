// grab all the elements
const card = document.getElementById("card");
const tempInput = document.getElementById("tempInput");
const unitTag = document.getElementById("unitTag");
const errMsg = document.getElementById("errMsg");
const inputField = document.getElementById("inputField");
const convSel = document.getElementById("convSel");
const convertBtn = document.getElementById("convertBtn");
const resetBtn = document.getElementById("resetBtn");
const resultPanel = document.getElementById("resultPanel");
const resultLabel = document.getElementById("resultLabel");
const resultNum = document.getElementById("resultNum");
const resultUnit = document.getElementById("resultUnit");
const resultEq = document.getElementById("resultEq");


// conversion definitions
const convMap = {
  "c-f": {
    from: "°C",
    to: "°F",
    fn: (v) => (v * 9) / 5 + 32,
    eq: (v, r) => `${v}°C × 9/5 + 32 = ${r}°F`,
  },
  "f-c": {
    from: "°F",
    to: "°C",
    fn: (v) => ((v - 32) * 5) / 9,
    eq: (v, r) => `(${v}°F − 32) × 5/9 = ${r}°C`,
  },
  "c-k": {
    from: "°C",
    to: "K",
    fn: (v) => v + 273.15,
    eq: (v, r) => `${v}°C + 273.15 = ${r} K`,
  },
  "k-c": {
    from: "K",
    to: "°C",
    fn: (v) => v - 273.15,
    eq: (v, r) => `${v} K − 273.15 = ${r}°C`,
  },
};

// format the result nicely
function formatNum(n) {
  if (!isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs === 0) return "0";
  if (abs >= 1000) return n.toFixed(2);
  if (abs >= 10) return n.toFixed(3);
  return parseFloat(n.toPrecision(4)).toString();
}

// update the unit badge when dropdown changes
function updateBadge() {
  const conf = convMap[convSel.value];
  gsap.to(unitTag, {
    opacity: 0,
    y: -5,
    duration: 0.1,
    onComplete: () => {
      unitTag.textContent = conf.from;
      gsap.to(unitTag, { opacity: 1, y: 0, duration: 0.15 });
    },
  });
}

// show error
function showErr(msg) {
  errMsg.textContent = msg;
  errMsg.classList.add("show");
  tempInput.classList.add("error");

  // shake the field
  inputField.classList.remove("shake");
  void inputField.offsetWidth; // force reflow
  inputField.classList.add("shake");
}

// clear error
function clearErr() {
  errMsg.textContent = "";
  errMsg.classList.remove("show");
  tempInput.classList.remove("error");
}

// main convert logic
function doConvert() {
  const raw = tempInput.value.trim();
  const key = convSel.value;
  const conf = convMap[key];

  // validate
  if (raw === "") {
    showErr("Please enter a temperature value.");
    return;
  }

  const num = parseFloat(raw);

  if (isNaN(num)) {
    showErr("Enter a valid number.");
    return;
  }

  if (key === "k-c" && num < 0) {
    showErr("Kelvin can't be negative (0 K = absolute zero).");
    return;
  }

  if ((key === "c-f" || key === "c-k") && num < -273.15) {
    showErr("Below absolute zero (−273.15°C) is impossible.");
    return;
  }

  clearErr();

  const rawResult = conf.fn(num);
  const formatted = formatNum(rawResult);

  // show result panel
  resultPanel.classList.add("visible");
  resultPanel.classList.remove("err-state");
  resultLabel.textContent =
    conf.from.replace("°", "") + " → " + conf.to.replace("°", "");
  resultUnit.textContent = conf.to;
  resultEq.textContent = conf.eq(num, formatted);

  // animate the number switching out/in
  gsap.to(resultNum, {
    y: -18,
    opacity: 0,
    duration: 0.15,
    ease: "power2.in",
    onComplete: () => {
      resultNum.textContent = formatted;
      gsap.fromTo(
        resultNum,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.28, ease: "power3.out" },
      );
    },
  });

  // small bounce on the convert button
  gsap.fromTo(
    convertBtn,
    { scale: 0.95 },
    { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" },
  );
}

// reset everything
function doReset() {
  clearErr();
  tempInput.value = "";
  convSel.value = "c-f";
  updateBadge();

  // fade out result
  gsap.to(resultPanel, {
    opacity: 0,
    y: 6,
    duration: 0.2,
    onComplete: () => {
      resultPanel.classList.remove("visible");
      resultNum.textContent = "—";
      resultUnit.textContent = "";
      resultEq.textContent = "";
      resultLabel.textContent = "Result";
      gsap.set(resultPanel, { opacity: 1, y: 0 });
    },
  });

  // spin the reset icon
  const icon = resetBtn.querySelector("svg");
  gsap.fromTo(
    icon,
    { rotation: 0 },
    { rotation: -360, duration: 0.5, ease: "power2.out" },
  );

  tempInput.focus();
}

// button events
convertBtn.addEventListener("click", doConvert);
resetBtn.addEventListener("click", doReset);

// enter key
tempInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") doConvert();
});

// dropdown change
convSel.addEventListener("change", () => {
  updateBadge();
  // re-convert if there's already a value
  if (tempInput.value.trim() !== "") doConvert();
});

// clear error while typing
tempInput.addEventListener("input", () => {
  if (tempInput.classList.contains("error")) clearErr();
});

// hover micro effect on convert button
convertBtn.addEventListener("mouseenter", () => {
  gsap.to(convertBtn.querySelector("svg"), { x: 3, duration: 0.18 });
});
convertBtn.addEventListener("mouseleave", () => {
  gsap.to(convertBtn.querySelector("svg"), { x: 0, duration: 0.18 });
});

// ---- page load animations ----
window.addEventListener("DOMContentLoaded", () => {
  // card entrance
  gsap.to(card, {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.7,
    ease: "back.out(1.5)",
    delay: 0.1,
  });

  // stagger the card sections in
  gsap.from([".header", ".divider", ".body"], {
    opacity: 0,
    y: 14,
    stagger: 0.08,
    duration: 0.45,
    ease: "power3.out",
    delay: 0.45,
  });

  // floating symbols bobbing around
  const floaters = document.querySelectorAll(".floaters span");
  floaters.forEach((el, i) => {
    // fade in
    gsap.from(el, { opacity: 0, duration: 1, delay: 0.2 + i * 0.12 });

    // loop up/down
    gsap.to(el, {
      y: i % 2 === 0 ? 20 : -20,
      duration: 3 + i * 0.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: i * 0.3,
    });
  });

  // orbs drifting
  gsap.to(".orb1", {
    x: 25,
    y: 18,
    duration: 9,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
  gsap.to(".orb2", {
    x: -20,
    y: -25,
    duration: 11,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay: 1,
  });

  // icon glow pulse
  gsap.to(".icon-box", {
    boxShadow: "0 0 0 6px rgba(59, 127, 255, 0.1)",
    duration: 1.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  updateBadge();
  tempInput.focus();
});
