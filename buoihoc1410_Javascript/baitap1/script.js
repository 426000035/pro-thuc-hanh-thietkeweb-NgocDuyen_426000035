const conversionForm = document.querySelector("#conversionForm");
const usdAmountInput = document.querySelector("#usdAmount");
const errorMessage = document.querySelector("#errorMessage");
const vndResult = document.querySelector("#vndResult");
const resultCaption = document.querySelector("#resultCaption");
const exchangeRate = 25000;
const vndFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 2,
});

// Xóa lỗi ngay khi người dùng bắt đầu điều chỉnh dữ liệu nhập.
usdAmountInput.addEventListener("input", () => {
  errorMessage.textContent = "";
  usdAmountInput.setAttribute("aria-invalid", "false");
});

conversionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const enteredAmount = usdAmountInput.value.trim();
  const usdAmount = Number(enteredAmount);

  // Kiểm tra theo thứ tự để mỗi trường hợp nhập sai có hướng dẫn cụ thể.
  if (enteredAmount === "") {
    showError("Vui lòng nhập số tiền USD cần chuyển đổi.");
    return;
  }

  if (!Number.isFinite(usdAmount)) {
    showError("Số tiền không hợp lệ. Hãy nhập một giá trị dạng số.");
    return;
  }

  if (usdAmount < 0) {
    showError("Số tiền USD không thể là số âm.");
    return;
  }

  errorMessage.textContent = "";
  usdAmountInput.setAttribute("aria-invalid", "false");

  // Áp dụng tỷ giá cố định, sau đó định dạng kết quả theo cách viết số tiếng Việt.
  const vndAmount = usdAmount * exchangeRate;
  vndResult.textContent = `${vndFormatter.format(vndAmount)} VND`;
  resultCaption.textContent = `${vndFormatter.format(usdAmount)} USD × 25.000`;

  // Khởi động lại hiệu ứng để kết quả vẫn phản hồi khi chuyển đổi nhiều lần.
  vndResult.classList.remove("has-result");
  requestAnimationFrame(() => vndResult.classList.add("has-result"));
});

function showError(message) {
  errorMessage.textContent = message;
  usdAmountInput.setAttribute("aria-invalid", "true");
  vndResult.classList.remove("has-result");
  vndResult.textContent = "—";
  resultCaption.textContent = "Kết quả sẽ hiển thị tại đây";
}