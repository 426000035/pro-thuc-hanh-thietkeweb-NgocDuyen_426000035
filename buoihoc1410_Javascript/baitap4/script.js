// Thông tin đăng nhập cố định dùng cho bài mô phỏng.
const username = "admin";
const password = "123456";

const loginForm = document.querySelector("#loginForm");
const usernameInput = document.querySelector("#usernameInput");
const passwordInput = document.querySelector("#passwordInput");
const resultMessage = document.querySelector("#resultMessage");
const loginCard = document.querySelector(".login-card");

// Xóa phản hồi cũ khi người dùng bắt đầu nhập lại thông tin.
[usernameInput, passwordInput].forEach((input) => {
  input.addEventListener("input", () => {
    resultMessage.textContent = "";
    resultMessage.classList.remove("is-success", "is-error");
    loginCard.classList.remove("has-error");
  });
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const enteredUsername = usernameInput.value.trim();
  const enteredPassword = passwordInput.value;

  // Chỉ thành công khi cả tên đăng nhập và mật khẩu đều khớp.
  if (enteredUsername === username && enteredPassword === password) {
    resultMessage.textContent = "Đăng nhập thành công";
    resultMessage.classList.remove("is-error");
    resultMessage.classList.add("is-success");
    loginCard.classList.remove("has-error");
  } else {
    resultMessage.textContent = "Thông tin không chính xác";
    resultMessage.classList.remove("is-success", "is-error");
    loginCard.classList.remove("has-error");

    // Khởi động lại hiệu ứng để lần đăng nhập sai nào cũng được phản hồi nhẹ.
    requestAnimationFrame(() => {
      resultMessage.classList.add("is-error");
      loginCard.classList.add("has-error");
    });
  }
});
