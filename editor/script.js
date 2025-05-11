let editor;

require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs",
  },
});

require(["vs/editor/editor.main"], function () {
  editor = monaco.editor.create(document.getElementById("editor"), {
    value:
      '// JavaScriptコードをここに書いてください\nconsole.log("Hello, World!");',
    language: "javascript",
    theme: "vs",
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
    fontSize: 14,
    lineNumbers: "on",
    roundedSelection: false,
    scrollBeyondLastLine: false,
    readOnly: false,
    cursorStyle: "line",
    tabSize: 2,
    insertSpaces: true,
  });

  // 実行ボタンのイベントリスナー
  document.getElementById("runBtn").addEventListener("click", runCode);

  // 出力クリアボタンのイベントリスナー
  document
    .getElementById("clearOutputBtn")
    .addEventListener("click", clearOutput);
});

// コードを実行する関数
function runCode() {
  const code = editor.getValue();
  const output = document.getElementById("output");

  try {
    // コンソール出力をキャプチャするための関数
    const logs = [];
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = function (...args) {
      logs.push(
        args
          .map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
          )
          .join(" ")
      );
      originalConsoleLog.apply(console, args);
    };

    console.error = function (...args) {
      logs.push(
        args
          .map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
          )
          .join(" ")
      );
      originalConsoleError.apply(console, args);
    };

    // コードを実行
    const result = new Function(code)();

    // コンソール出力を元に戻す
    console.log = originalConsoleLog;
    console.error = originalConsoleError;

    // 出力を表示
    if (logs.length > 0) {
      const logElement = document.createElement("div");
      logElement.className = "success";
      logElement.textContent = logs.join("\n");
      output.appendChild(logElement);
    }

    if (result !== undefined) {
      const resultElement = document.createElement("div");
      resultElement.className = "success";
      resultElement.textContent =
        "結果: " +
        (typeof result === "object"
          ? JSON.stringify(result, null, 2)
          : String(result));
      output.appendChild(resultElement);
    }
  } catch (error) {
    const errorElement = document.createElement("div");
    errorElement.className = "error";
    errorElement.textContent = "エラー: " + error.message;
    output.appendChild(errorElement);
  }

  // 出力を自動スクロール
  output.scrollTop = output.scrollHeight;
}

// 出力をクリアする関数
function clearOutput() {
  const output = document.getElementById("output");
  output.innerHTML = "";
}
