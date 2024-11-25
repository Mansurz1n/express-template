async function handleLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.text();
    alert(result); 
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao fazer login");
  }
}

async function handleSignUp() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const birthdate = document.getElementById("birthdate").value;

  try {
    const response = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, birthdate }),
    });

    const result = await response.text();
    alert(result); 
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao criar conta");
  }
}
