const discountForm = document.querySelector("#discountForm");
const billAmountInput = document.querySelector("#billAmount");
const errorMessage = document.querySelector("#errorMessage");
const resultPanel = document.querySelector(".result-panel");
const originalAmountOutput = document.querySelector("#originalAmount");
const discountRateOutput = document.querySelector("#discountRate");
const discountAmountOutput = document.querySelector("#discountAmount");
const finalAmountOutput = document.querySelector("#finalAmount");
const resultCaption = document.querySelector("#resultCaption");
const discountThreshold = 500000;
const vndFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
});

// Xóa lỗi và kết quả cũ khi người dùng bắt đầu nhập lại hóa đơn.
billAmountInput.addEventListener("input", () => {
  errorMessage.textContent = "";
  billAmountInput.setAttribute("aria-invalid", "false");
  resetResult();
});

discountForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const enteredAmount = billAmountInput.value.trim();

  if (enteredAmount === "") {
    showError("Vui lòng nhập số tiền hóa đơn.");
    return;
  }

  const billAmount = Number(enteredAmount);

  if (!Number.isFinite(billAmount)) {
    showError("Số tiền không hợp lệ. Hãy nhập một giá trị dạng số.");
    return;
  }

  if (billAmount < 0) {
    showError("Số tiền hóa đơn không thể là số âm.");
    return;
  }

  let discountRate;
  let discountAmount;
  let finalAmount;

  // Chỉ hóa đơn lớn hơn 500.000 VND mới được giảm 10%.
  if (billAmount > discountThreshold) {
    discountRate = 0.1;
    discountAmount = billAmount * discountRate;
    finalAmount = billAmount - discountAmount;
  } else {
    discountRate = 0;
    discountAmount = 0;
    finalAmount = billAmount;
  }

  errorMessage.textContent = "";
  billAmountInput.setAttribute("aria-invalid", "false");
  originalAmountOutput.textContent = `${vndFormatter.format(billAmount)} VND`;
  discountRateOutput.textContent = `${discountRate * 100}%`;
  discountAmountOutput.textContent = `${vndFormatter.format(discountAmount)} VND`;
  finalAmountOutput.textContent = `${vndFormatter.format(finalAmount)} VND`;
  resultCaption.textContent = discountRate > 0
    ? "Hóa đơn đủ điều kiện áp dụng giảm giá 10%."
    : "Hóa đơn không vượt ngưỡng giảm giá 500.000 VND.";

  // Chạy lại hiệu ứng để kết quả phản hồi sau mỗi lần tính toán.
  resultPanel.classList.remove("has-result");
  requestAnimationFrame(() => resultPanel.classList.add("has-result"));
});

function showError(message) {
  errorMessage.textContent = message;
  billAmountInput.setAttribute("aria-invalid", "true");
  resetResult();
}

function resetResult() {
  resultPanel.classList.remove("has-result");
  originalAmountOutput.textContent = "—";
  discountRateOutput.textContent = "—";
  discountAmountOutput.textContent = "—";
  finalAmountOutput.textContent = "—";
  resultCaption.textContent = "Kết quả sẽ hiển thị tại đây";
}
