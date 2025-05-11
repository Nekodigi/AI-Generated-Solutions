let editor;
let apiKey = localStorage.getItem("openai_api_key") || "";
let currentSuggestion = null;
let suggestionTimeout = null;
let lastPosition = null;

document.addEventListener("DOMContentLoaded", () => {
  editor = document.getElementById("editor");

  // エディタの初期化
  editor.value = "テキストを入力してください...";
  editor.style.whiteSpace = "nowrap"; // 折り返しを無効化
  editor.style.overflowX = "auto"; // 横スクロールを有効化

  // 初期テキストをクリアする処理
  editor.addEventListener("focus", function () {
    if (editor.value === "テキストを入力してください...") {
      editor.value = "";
    }
  });

  // エディタがフォーカスを失ったときに、空なら初期テキストを表示
  editor.addEventListener("blur", function () {
    if (editor.value === "") {
      editor.value = "テキストを入力してください...";
    }
  });

  // 保存ボタンのイベントリスナー
  document.getElementById("saveBtn").addEventListener("click", saveText);

  // AIアシスタントパネルの表示/非表示
  const aiBtn = document.getElementById("aiBtn");
  const aiPanel = document.querySelector(".ai-panel");
  const closeAiBtn = document.getElementById("closeAiBtn");

  aiBtn.addEventListener("click", () => {
    aiPanel.style.display = "flex";
  });

  closeAiBtn.addEventListener("click", () => {
    aiPanel.style.display = "none";
  });

  // APIキーの保存
  const apiKeyInput = document.getElementById("apiKey");
  const saveApiKeyBtn = document.getElementById("saveApiKeyBtn");

  apiKeyInput.value = apiKey;

  saveApiKeyBtn.addEventListener("click", () => {
    apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      localStorage.setItem("openai_api_key", apiKey);
      alert("APIキーを保存しました");
    } else {
      alert("APIキーを入力してください");
    }
  });

  // テキスト変更時のサジェスト処理
  editor.addEventListener("input", handleInput);

  // Tabキーでサジェストを採用
  editor.addEventListener("keydown", handleKeyDown);
});

// 入力処理
function handleInput() {
  if (suggestionTimeout) {
    clearTimeout(suggestionTimeout);
  }

  suggestionTimeout = setTimeout(async () => {
    if (!apiKey) return;

    const text = editor.value;
    const position = editor.selectionStart;
    const currentWord = getCurrentWord(text, position);

    if (currentWord.length < 2) {
      clearSuggestion();
      return;
    }

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "あなたはテキスト補完アシスタントです。ユーザーの入力に基づいて、自然な文章の続きを提案してください。提案は簡潔に、かつ文脈に沿ったものにしてください。",
              },
              {
                role: "user",
                content: `以下のテキストの続きを提案してください。現在の単語は「${currentWord}」です：\n\n${text}`,
              },
            ],
            max_tokens: 1000,
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        const suggestion = data.choices[0].message.content.trim();
        showSuggestion(suggestion, currentWord);
      }
    } catch (error) {
      console.error("サジェストエラー:", error);
      clearSuggestion();
    }
  }, 500);
}

// キー入力処理
function handleKeyDown(e) {
  if (e.key === "Tab" && currentSuggestion) {
    e.preventDefault();
    const position = editor.selectionStart;
    const text = editor.value;
    const currentWord = getCurrentWord(text, position);

    // 現在の単語を保持したまま、サジェストを追加（透明な文字は除外）
    const before = text.substring(0, position);
    const after = text.substring(position);
    const suggestionText =
      currentSuggestion.querySelector("span:last-child").textContent;
    editor.value = before + suggestionText + after;
    editor.selectionStart = editor.selectionEnd =
      position + suggestionText.length;

    clearSuggestion();
  }
}

// 現在の単語を取得
function getCurrentWord(text, position) {
  const beforeCursor = text.substring(0, position);
  const words = beforeCursor.split(/\s+/);
  return words[words.length - 1] || "";
}

// サジェストを表示
function showSuggestion(suggestion, currentWord) {
  clearSuggestion();

  const suggestionElement = document.createElement("div");
  suggestionElement.className = "suggestion-text";

  // 現在の単語を透明な文字として追加
  const invisibleSpan = document.createElement("span");
  invisibleSpan.textContent = currentWord;
  invisibleSpan.style.color = "transparent";
  suggestionElement.appendChild(invisibleSpan);

  // サジェストを追加
  const suggestionSpan = document.createElement("span");
  suggestionSpan.textContent = suggestion;
  suggestionSpan.style.color = "#868e96";
  suggestionElement.appendChild(suggestionSpan);

  const editorWrapper = document.querySelector(".editor-wrapper");
  const position = editor.selectionStart;
  const textBeforeCursor = editor.value.substring(0, position);
  const lines = textBeforeCursor.split("\n");
  const currentLine = lines[lines.length - 1];

  // エディタのスタイルを取得
  const editorStyle = window.getComputedStyle(editor);
  const fontSize = parseInt(editorStyle.fontSize);
  const lineHeight = parseInt(editorStyle.lineHeight) || fontSize * 1.2;
  const charWidth = 8; // 概算の文字幅

  // カーソル位置を計算
  const top =
    (lines.length - 1) * lineHeight + parseInt(editorStyle.paddingTop);
  const left =
    (currentLine.length - currentWord.length) * charWidth +
    parseInt(editorStyle.paddingLeft);

  // デバッグ用のログ
  console.log({
    lines: lines.length,
    lineHeight,
    fontSize,
    paddingTop: parseInt(editorStyle.paddingTop),
    calculatedTop: top,
  });

  suggestionElement.style.position = "absolute";
  suggestionElement.style.top = `${top}px`;
  suggestionElement.style.left = `${left}px`;
  suggestionElement.style.pointerEvents = "none";
  suggestionElement.style.zIndex = "1";
  suggestionElement.style.fontStyle = "italic";
  suggestionElement.style.fontFamily = editorStyle.fontFamily;
  suggestionElement.style.fontSize = editorStyle.fontSize;
  suggestionElement.style.lineHeight = editorStyle.lineHeight;
  suggestionElement.style.whiteSpace = "pre";
  suggestionElement.style.padding = "0";
  suggestionElement.style.margin = "0";

  editorWrapper.style.position = "relative";
  editorWrapper.appendChild(suggestionElement);
  currentSuggestion = suggestionElement;
}

// サジェストをクリア
function clearSuggestion() {
  if (currentSuggestion) {
    currentSuggestion.remove();
    currentSuggestion = null;
  }
}

// テキストの保存
function saveText() {
  const text = editor.value;
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "document.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
