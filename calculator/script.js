const result = document.getElementById("result");

function appendNumber(number) {
  result.value += number;
}

function appendOperator(operator) {
  if (result.value !== "") {
    const lastChar = result.value.slice(-1);
    if ("+-*/%".includes(lastChar)) {
      result.value = result.value.slice(0, -1) + operator;
    } else {
      result.value += operator;
    }
  }
}

function clearDisplay() {
  result.value = "";
}

function deleteLastChar() {
  result.value = result.value.slice(0, -1);
}

function calculate() {
  try {
    const expression = result.value.replace(/×/g, "*");
    result.value = eval(expression);
  } catch (error) {
    result.value = "Error";
    setTimeout(clearDisplay, 1000);
  }
}

// キーボード入力のサポート
document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/[0-9]/.test(key)) {
    appendNumber(key);
  } else if (["+", "-", "*", "/", "%"].includes(key)) {
    appendOperator(key);
  } else if (key === "Enter") {
    calculate();
  } else if (key === "Backspace") {
    deleteLastChar();
  } else if (key === "Escape") {
    clearDisplay();
  } else if (key === ".") {
    appendNumber(".");
  }
});
