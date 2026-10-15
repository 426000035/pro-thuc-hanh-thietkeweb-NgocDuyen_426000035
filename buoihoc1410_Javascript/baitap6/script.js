const triangleForm = document.querySelector("#triangleForm");
const sideInputs = [
  document.querySelector("#sideAInput"),
  document.querySelector("#sideBInput"),
  document.querySelector("#sideCInput"),
];
const sideNames = ["a", "b", "c"];
const errorMessage = document.querySelector("#errorMessage");
const triangleResult = document.querySelector("#triangleResult");
const triangleFigure = document.querySelector("#triangleFigure");
const resultPanel = document.querySelector(".result-panel");
const triangleShape = document.querySelector("#triangleShape");
const triangleSvgTitle = document.querySelector("#triangleSvgTitle");
const triangleSvgDescription = document.querySelector("#triangleSvgDescription");
const figureTag = document.querySelector("#figureTag");
const sideLabels = [
  document.querySelector("#sideALabel"),
  document.querySelector("#sideBLabel"),
  document.querySelector("#sideCLabel"),
];
const sideFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 6,
});
const simulationPanel = document.querySelector("#simulationPanel");
const simulationCode = document.querySelector("#simulationCode");
const stepCounter = document.querySelector("#stepCounter");
const stepTitle = document.querySelector("#stepTitle");
const stepExpression = document.querySelector("#stepExpression");
const stepExplanation = document.querySelector("#stepExplanation");
const startSimulationButton = document.querySelector("#startSimulation");
const previousStepButton = document.querySelector("#previousStep");
const nextStepButton = document.querySelector("#nextStep");
const autoSimulationButton = document.querySelector("#autoSimulation");
const restartSimulationButton = document.querySelector("#restartSimulation");
let simulationData = null;
let simulationSteps = [];
let currentStepIndex = -1;
let autoTimer = null;

// Xóa lỗi và hình cũ khi người dùng thay đổi một trong ba cạnh.
sideInputs.forEach((input) => {
  input.addEventListener("input", () => {
    stopAutomaticRun();
    errorMessage.textContent = "";
    sideInputs.forEach((sideInput) => sideInput.setAttribute("aria-invalid", "false"));
    resetResult();
    resetSimulation();
  });
});

triangleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  stopAutomaticRun();

  const enteredSides = sideInputs.map((input) => input.value.trim());

  // Kiểm tra từng cạnh để thông báo rõ dữ liệu nào cần được bổ sung hoặc sửa.
  for (let index = 0; index < enteredSides.length; index += 1) {
    if (enteredSides[index] === "") {
      showError(`Vui lòng nhập độ dài cạnh ${sideNames[index]}.`, [sideInputs[index]]);
      return;
    }
  }

  const sideValues = enteredSides.map((side) => Number(side));

  for (let index = 0; index < sideValues.length; index += 1) {
    if (!Number.isFinite(sideValues[index])) {
      showError(`Độ dài cạnh ${sideNames[index]} phải là một số hợp lệ.`, [sideInputs[index]]);
      return;
    }

    if (sideValues[index] <= 0) {
      showError(`Độ dài cạnh ${sideNames[index]} phải lớn hơn 0.`, [sideInputs[index]]);
      return;
    }
  }

  errorMessage.textContent = "";
  sideInputs.forEach((input) => input.setAttribute("aria-invalid", "false"));

  const [sideA, sideB, sideC] = sideValues;
  const largestSide = Math.max(...sideValues);
  const normalizedSides = sideValues.map((side) => side / largestSide);

  // Kiểm tra cạnh có thể tạo thành tam giác trước khi dựng hình đúng tỉ lệ.
  if (
    normalizedSides[0] + normalizedSides[1] <= normalizedSides[2]
    || normalizedSides[0] + normalizedSides[2] <= normalizedSides[1]
    || normalizedSides[1] + normalizedSides[2] <= normalizedSides[0]
  ) {
    showError("Ba độ dài này không thể ghép thành một tam giác.");
    return;
  }

  // Tách hai phép so sánh để từng bước mô phỏng phản ánh đúng mã JavaScript.
  const a = sideA;
  const b = sideB;
  const c = sideC;
  const soSanhAB = a === b;
  const soSanhBC = b === c;
  const isEquilateral = soSanhAB && soSanhBC;

  simulationData = { a, b, c, normalizedSides, soSanhAB, soSanhBC, isEquilateral };
  simulationSteps = createSimulationSteps(simulationData);
  renderProgram(simulationData);
  resetResult();
  triangleResult.textContent = "Kết quả sẽ xuất hiện ở bước 6.";
  simulationPanel.hidden = false;
  currentStepIndex = -1;
  stepCounter.textContent = "SẴN SÀNG";
  stepTitle.textContent = "Dữ liệu đã sẵn sàng";
  stepExpression.textContent = "Nhấn “Bắt đầu mô phỏng” để chạy từng bước.";
  stepExplanation.textContent = "Các dòng code và kết quả được tạo từ ba cạnh bạn vừa nhập.";
  updateSimulationControls();
});

startSimulationButton.addEventListener("click", () => {
  if (simulationData) {
    showStep(0);
    updateSimulationControls();
  }
});

previousStepButton.addEventListener("click", () => {
  if (currentStepIndex > 0) {
    showStep(currentStepIndex - 1);
    updateSimulationControls();
  }
});

nextStepButton.addEventListener("click", () => {
  advanceSimulation();
});

autoSimulationButton.addEventListener("click", () => {
  if (autoTimer !== null) {
    stopAutomaticRun();
    updateSimulationControls();
    return;
  }

  if (!simulationData || currentStepIndex >= simulationSteps.length - 1) {
    return;
  }

  if (currentStepIndex < 0) {
    showStep(0);
  }

  autoSimulationButton.textContent = "Dừng tự động";
  autoTimer = window.setInterval(() => {
    if (currentStepIndex >= simulationSteps.length - 1) {
      stopAutomaticRun();
      updateSimulationControls();
      return;
    }

    showStep(currentStepIndex + 1);

    if (currentStepIndex >= simulationSteps.length - 1) {
      stopAutomaticRun();
    }

    updateSimulationControls();
  }, 900);
  updateSimulationControls();
});

restartSimulationButton.addEventListener("click", () => {
  stopAutomaticRun();
  if (simulationData) {
    showStep(0);
    updateSimulationControls();
  }
});

function createSimulationSteps(data) {
  const { a, b, c, soSanhAB, soSanhBC, isEquilateral } = data;
  const resultMessage = isEquilateral
    ? "Đây là tam giác đều"
    : "Đây không phải là tam giác đều";

  return [
    {
      title: "Bước 1: Nhận dữ liệu",
      expression: `a = ${a}, b = ${b}, c = ${c}`,
      explanation: "JavaScript lấy giá trị từ ba ô nhập, chuyển thành số và xác nhận cả ba cạnh đều hợp lệ.",
      lines: [0, 1, 2],
    },
    {
      title: "Bước 2: So sánh cạnh a và b",
      expression: `${a} === ${b} → ${soSanhAB}`,
      explanation: `Toán tử === so sánh giá trị và kiểu dữ liệu. Kết quả của phép so sánh a === b là ${soSanhAB}.`,
      lines: [3],
    },
    {
      title: "Bước 3: So sánh cạnh b và c",
      expression: `${b} === ${c} → ${soSanhBC}`,
      explanation: `Kết quả của phép so sánh b === c là ${soSanhBC}.`,
      lines: [4],
    },
    {
      title: "Bước 4: Đánh giá điều kiện",
      expression: `${soSanhAB} && ${soSanhBC} → ${isEquilateral}`,
      explanation: "Toán tử && chỉ cho kết quả true khi cả hai phép so sánh đều true.",
      lines: [5],
    },
    {
      title: "Bước 5: Chọn nhánh điều kiện",
      expression: `ketQua là ${isEquilateral} → chạy nhánh ${isEquilateral ? "if" : "else"}`,
      explanation: isEquilateral
        ? "Cả hai phép so sánh đều đúng, nên chương trình chạy nhánh if."
        : "Có ít nhất một phép so sánh sai, nên điều kiện tổng thể false và chương trình chạy nhánh else.",
      lines: isEquilateral ? [6, 7] : [6, 8, 9],
      branchLines: isEquilateral ? [7] : [8, 9],
    },
    {
      title: "Bước 6: Xuất kết quả",
      expression: `console.log("${resultMessage}")`,
      explanation: `${resultMessage}. Kết quả này được đồng bộ với thông báo và hình tam giác bên trên.`,
      lines: [isEquilateral ? 7 : 9],
      outputMessage: resultMessage,
    },
  ];
}

function renderProgram(data) {
  const codeLines = [
    `const a = ${data.a};`,
    `const b = ${data.b};`,
    `const c = ${data.c};`,
    "const soSanhAB = a === b;",
    "const soSanhBC = b === c;",
    "const ketQua = soSanhAB && soSanhBC;",
    "if (ketQua) {",
    '  console.log("Đây là tam giác đều");',
    "} else {",
    '  console.log("Đây không phải là tam giác đều");',
    "}",
  ];

  simulationCode.replaceChildren();
  codeLines.forEach((sourceLine) => {
    const line = document.createElement("li");
    const code = document.createElement("code");
    line.className = "code-line";
    code.textContent = sourceLine;
    line.append(code);
    simulationCode.append(line);
  });
}

function showStep(stepIndex) {
  currentStepIndex = stepIndex;
  const step = simulationSteps[stepIndex];

  stepCounter.textContent = `BƯỚC ${stepIndex + 1} / ${simulationSteps.length}`;
  stepTitle.textContent = step.title;
  stepExpression.textContent = step.expression;
  stepExplanation.classList.remove("is-updated");
  stepExplanation.textContent = step.explanation;

  [...simulationCode.children].forEach((line, index) => {
    line.classList.remove("is-active", "is-branch");
    if (step.lines.includes(index)) {
      line.classList.add("is-active");
    }
    if (step.branchLines?.includes(index)) {
      line.classList.add("is-branch");
    }
  });

  if (step.outputMessage) {
    renderTriangleResult(step.outputMessage);
  } else {
    resetResult();
    triangleResult.textContent = "Kết quả sẽ xuất hiện ở bước 6.";
  }

  requestAnimationFrame(() => stepExplanation.classList.add("is-updated"));
}

function renderTriangleResult(message) {
  const { a, b, c, normalizedSides, isEquilateral } = simulationData;

  if (!drawTriangle(normalizedSides)) {
    showError("Không thể hiển thị hình tam giác theo tỉ lệ của các cạnh đã nhập.");
    return;
  }

  triangleResult.textContent = message;
  triangleResult.classList.toggle("is-equal", isEquilateral);
  triangleResult.classList.toggle("is-unequal", !isEquilateral);
  resultPanel.classList.toggle("is-equal", isEquilateral);
  triangleFigure.classList.toggle("is-equal", isEquilateral);
  triangleFigure.classList.toggle("is-unequal", !isEquilateral);
  triangleSvgTitle.textContent = isEquilateral
    ? "Hình minh họa tam giác đều"
    : "Hình minh họa tam giác theo tỉ lệ các cạnh";
  figureTag.textContent = isEquilateral ? "BA CẠNH BẰNG NHAU" : "BA CẠNH KHÔNG BẰNG NHAU";
  sideLabels.forEach((label, index) => {
    label.textContent = sideNames[index];
  });
  triangleSvgDescription.textContent = `Độ dài cạnh a là ${sideFormatter.format(a)}, cạnh b là ${sideFormatter.format(b)}, cạnh c là ${sideFormatter.format(c)}.`;
  triangleFigure.hidden = false;
  triangleFigure.classList.remove("is-visible");
  requestAnimationFrame(() => triangleFigure.classList.add("is-visible"));
}

function advanceSimulation() {
  if (currentStepIndex < simulationSteps.length - 1) {
    showStep(currentStepIndex + 1);
    updateSimulationControls();
  }
}

function stopAutomaticRun() {
  if (autoTimer !== null) {
    window.clearInterval(autoTimer);
    autoTimer = null;
  }
  autoSimulationButton.textContent = "Chạy tự động";
}

function updateSimulationControls() {
  const isReady = simulationData !== null;
  const isRunning = autoTimer !== null;
  const isAtEnd = currentStepIndex >= simulationSteps.length - 1;

  startSimulationButton.disabled = !isReady || currentStepIndex >= 0;
  previousStepButton.disabled = !isReady || currentStepIndex <= 0 || isRunning;
  nextStepButton.disabled = !isReady || currentStepIndex < 0 || isAtEnd || isRunning;
  autoSimulationButton.disabled = !isReady || (isAtEnd && !isRunning);
  restartSimulationButton.disabled = !isReady;
}

function drawTriangle(normalizedSides) {
  const [sideA, sideB, sideC] = normalizedSides;
  const apexOffset = (sideA ** 2 + sideC ** 2 - sideB ** 2) / (2 * sideA);
  const triangleHeight = Math.sqrt(Math.max(0, sideC ** 2 - apexOffset ** 2));

  if (!Number.isFinite(triangleHeight) || triangleHeight <= 0) {
    return false;
  }

  // Dùng cùng một hệ số cho hai trục để bảo toàn tỉ lệ hình học.
  const scale = Math.min(280 / sideA, 180 / triangleHeight);
  const baseWidth = sideA * scale;
  const baseY = (280 + triangleHeight * scale) / 2;
  const baseLeft = { x: (400 - baseWidth) / 2, y: baseY };
  const baseRight = { x: baseLeft.x + baseWidth, y: baseY };
  const apex = {
    x: baseLeft.x + apexOffset * scale,
    y: baseY - triangleHeight * scale,
  };
  const vertices = [apex, baseLeft, baseRight];
  const formatCoordinate = (coordinate) => Number(coordinate.toFixed(3));

  triangleShape.setAttribute("points", vertices
    .map((vertex) => `${formatCoordinate(vertex.x)},${formatCoordinate(vertex.y)}`)
    .join(" "));

  // Đặt tên cạnh ra phía ngoài tam giác dựa trên hướng của mỗi cạnh.
  placeSideLabel(sideLabels[0], baseLeft, baseRight, vertices, formatCoordinate);
  placeSideLabel(sideLabels[1], apex, baseRight, vertices, formatCoordinate);
  placeSideLabel(sideLabels[2], apex, baseLeft, vertices, formatCoordinate);

  return true;
}

function placeSideLabel(label, start, end, vertices, formatCoordinate) {
  const midpointX = (start.x + end.x) / 2;
  const midpointY = (start.y + end.y) / 2;
  const normalX = -(end.y - start.y);
  const normalY = end.x - start.x;
  const normalLength = Math.hypot(normalX, normalY);
  const centerX = vertices.reduce((sum, vertex) => sum + vertex.x, 0) / vertices.length;
  const centerY = vertices.reduce((sum, vertex) => sum + vertex.y, 0) / vertices.length;
  const pointsTowardCenter = (centerX - midpointX) * normalX + (centerY - midpointY) * normalY > 0;
  const direction = pointsTowardCenter ? -1 : 1;

  label.setAttribute("x", formatCoordinate(midpointX + (normalX / normalLength) * 17 * direction));
  label.setAttribute("y", formatCoordinate(midpointY + (normalY / normalLength) * 17 * direction));
}

function showError(message, invalidInputs = sideInputs) {
  errorMessage.textContent = message;
  sideInputs.forEach((input) => input.setAttribute("aria-invalid", "false"));
  invalidInputs.forEach((input) => input.setAttribute("aria-invalid", "true"));
  resetSimulation();
  resetResult();
}

function resetResult() {
  resultPanel.classList.remove("is-equal");
  triangleFigure.hidden = true;
  triangleFigure.classList.remove("is-visible", "is-equal", "is-unequal");
  triangleResult.classList.remove("is-equal", "is-unequal");
  triangleResult.textContent = "Kết quả sẽ xuất hiện sau khi kiểm tra.";
}

function resetSimulation() {
  stopAutomaticRun();
  simulationData = null;
  simulationSteps = [];
  currentStepIndex = -1;
  simulationPanel.hidden = true;
  simulationCode.replaceChildren();
  stepCounter.textContent = "SẴN SÀNG";
  stepTitle.textContent = "Chuẩn bị dữ liệu";
  stepExpression.textContent = "Nhập ba cạnh hợp lệ rồi nhấn “Kiểm tra tam giác”.";
  stepExplanation.textContent = "Mã và các bước thực thi sẽ được tạo từ chính những giá trị bạn nhập.";
  updateSimulationControls();
}
