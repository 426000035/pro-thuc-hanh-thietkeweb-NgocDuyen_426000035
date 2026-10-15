const bmiForm = document.querySelector("#bmiForm");
const heightInput = document.querySelector("#heightInput");
const weightInput = document.querySelector("#weightInput");
const errorMessage = document.querySelector("#errorMessage");
const bmiResult = document.querySelector("#bmiResult");
const resultCaption = document.querySelector("#resultCaption");
const resultEquation = document.querySelector("#resultEquation");

// Xóa trạng thái lỗi và kết quả cũ khi người dùng thay đổi một trong hai giá trị.
[heightInput, weightInput].forEach((input) => {
  input.addEventListener("input", () => {
    errorMessage.textContent = "";
    heightInput.setAttribute("aria-invalid", "false");
    weightInput.setAttribute("aria-invalid", "false");
    resetResult();
  });
});

bmiForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const enteredHeight = heightInput.value.trim();
  const enteredWeight = weightInput.value.trim();

  // Kiểm tra dữ liệu lần lượt để chỉ rõ trường nào cần được sửa.
  if (enteredHeight === "") {
    showError("Vui lòng nhập chiều cao của bạn.", heightInput);
    return;
  }

  const height = Number(enteredHeight);

  if (!Number.isFinite(height)) {
    showError("Chiều cao không hợp lệ. Hãy nhập một giá trị dạng số.", heightInput);
    return;
  }

  if (height <= 0) {
    showError("Chiều cao phải lớn hơn 0 mét.", heightInput);
    return;
  }

  if (enteredWeight === "") {
    showError("Vui lòng nhập cân nặng của bạn.", weightInput);
    return;
  }

  const weight = Number(enteredWeight);

  if (!Number.isFinite(weight)) {
    showError("Cân nặng không hợp lệ. Hãy nhập một giá trị dạng số.", weightInput);
    return;
  }

  if (weight <= 0) {
    showError("Cân nặng phải lớn hơn 0 kilôgam.", weightInput);
    return;
  }

  // Tính BMI theo công thức cân nặng chia cho bình phương chiều cao.
  const bmi = weight / (height * height);

  if (!Number.isFinite(bmi)) {
    showError("Giá trị quá lớn hoặc quá nhỏ để tính BMI chính xác.", heightInput);
    return;
  }

  heightInput.setAttribute("aria-invalid", "false");
  weightInput.setAttribute("aria-invalid", "false");
  errorMessage.textContent = "";
  bmiResult.textContent = bmi.toFixed(2);
  resultCaption.textContent = "Chỉ số BMI được tính từ dữ liệu bạn đã nhập.";
  resultEquation.textContent = `${weight} kg / (${height} m × ${height} m)`;

  // Chạy lại hiệu ứng để kết quả phản hồi mỗi lần người dùng tính BMI.
  bmiResult.classList.remove("has-result");
  requestAnimationFrame(() => bmiResult.classList.add("has-result"));
});

function showError(message, invalidInput) {
  errorMessage.textContent = message;
  invalidInput.setAttribute("aria-invalid", "true");
  resetResult();
}

function resetResult() {
  bmiResult.classList.remove("has-result");
  bmiResult.textContent = "—";
  resultCaption.textContent = "Kết quả sẽ hiển thị tại đây";
  resultEquation.textContent = "kg / m²";
}
