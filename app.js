// Hard-coded username & password
const correctUser = "admin";
const correctPass = "123456";

// LOGIN
function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  if (user === correctUser && pass === correctPass) {
    // Lưu trạng thái đăng nhập
    localStorage.setItem("loggedIn", "true");

    msg.style.color = "green";
    msg.textContent = "Đăng nhập thành công!";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 700);

  } else {
    msg.style.color = "red";
    msg.textContent = "Sai username hoặc password!";
  }
}

// CHECK LOGIN (để bảo vệ dashboard)
function checkLogin() {
  const status = localStorage.getItem("loggedIn");
  if (status !== "true") {
    window.location.href = "index.html";
  }
}

// LOGOUT
function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "index.html";
}
