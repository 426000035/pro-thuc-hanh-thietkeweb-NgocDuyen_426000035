const checkForm = document.querySelector("#checkForm");
const integerInput = document.querySelector("#integerInput");
const errorMessage = document.querySelector("#errorMessage");
const resultPanel = document.querySelector("#resultPanel");
const resultValue = document.querySelector("#resultValue");
const resultCaption = document.querySelector("#resultCaption");
const resultMark = document.querySelector("#resultMark");
const integerPattern = /^-?\d+$/;
const integerFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

// Xóa thông báo cũ và kết quả trước đó khi người dùng nhập giá trị mới.
integerInput.addEventListener("input", () => {
  errorMessage.textContent = "";
  integerInput.setAttribute("aria-invalid", "false");
  resetResult();
});

checkForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const enteredValue = integerInput.value.trim();

  if (enteredValue === "") {
    showError("Vui lòng nhập một số nguyên để kiểm tra.");
    return;
  }

  if (!integerPattern.test(enteredValue)) {
    showError("Dữ liệu chưa hợp lệ. Hãy nhập một số nguyên, không dùng số thập phân.");
    return;
  }

  const number = Number(enteredValue);

  if (!Number.isSafeInteger(number)) {
    showError("Số quá lớn để kiểm tra chính xác. Vui lòng nhập số nguyên nhỏ hơn.");
    return;
  }

  errorMessage.textContent = "";
  integerInput.setAttribute("aria-invalid", "false");

  // Dùng phép chia lấy dư để xác định tính chẵn/lẻ, bao gồm cả số âm và số 0.
  const isEven = number % 2 === 0;
  const remainder = number % 2;
  const formattedNumber = integerFormatter.format(number);

  resultPanel.classList.toggle("is-even", isEven);
  resultPanel.classList.toggle("is-odd", !isEven);
  resultValue.textContent = isEven ? "Số chẵn" : "Số lẻ";
  resultCaption.textContent = `${formattedNumber} % 2 = ${remainder}`;
  resultMark.textContent = isEven ? "02" : "01";

  // Chạy lại hiệu ứng để mỗi lần kiểm tra đều có phản hồi rõ ràng.
  resultValue.classList.remove("has-result");
  requestAnimationFrame(() => resultValue.classList.add("has-result"));
});

function showError(message) {
  errorMessage.textContent = message;
  integerInput.setAttribute("aria-invalid", "true");
  resetResult();
}

function resetResult() {
  resultPanel.classList.remove("is-even", "is-odd");
  resultValue.classList.remove("has-result");
  resultValue.textContent = "—";
  resultCaption.textContent = "Nhập số nguyên rồi nhấn Kiểm tra";
  resultMark.textContent = "%";
}