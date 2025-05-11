document.addEventListener("DOMContentLoaded", () => {
  const noteForm = document.querySelector(".note-form");
  const noteTitle = document.getElementById("noteTitle");
  const noteContent = document.getElementById("noteContent");
  const addNoteBtn = document.getElementById("addNoteBtn");
  const notesGrid = document.getElementById("notesGrid");

  // ローカルストレージからメモを読み込む
  let notes = JSON.parse(localStorage.getItem("notes")) || [];
  let editingIndex = -1; // 編集中のメモのインデックス

  // メモを表示する関数
  function displayNotes() {
    notesGrid.innerHTML = "";
    notes.forEach((note, index) => {
      const noteElement = createNoteElement(note, index);
      notesGrid.appendChild(noteElement);
    });
  }

  // メモ要素を作成する関数
  function createNoteElement(note, index) {
    const noteDiv = document.createElement("div");
    noteDiv.className = "note";
    noteDiv.innerHTML = `
      <div class="note-title">${note.title || "無題"}</div>
      <div class="note-content">${note.content}</div>
      <div class="note-footer">
        <div class="note-date">${new Date(note.date).toLocaleString()}</div>
        <div class="note-actions">
          <button class="edit-btn" title="編集">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="delete-btn" title="削除">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;

    // 編集ボタンのイベントリスナー
    const editBtn = noteDiv.querySelector(".edit-btn");
    editBtn.addEventListener("click", () => {
      noteTitle.value = note.title || "";
      noteContent.value = note.content;
      editingIndex = index;
      addNoteBtn.textContent = "更新";
      noteContent.focus();
    });

    // 削除ボタンのイベントリスナー
    const deleteBtn = noteDiv.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      if (confirm("このメモを削除しますか？")) {
        notes.splice(index, 1);
        localStorage.setItem("notes", JSON.stringify(notes));
        displayNotes();
      }
    });

    return noteDiv;
  }

  // メモを追加または更新する関数
  function addOrUpdateNote() {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (content) {
      if (editingIndex >= 0) {
        // 既存のメモを更新
        notes[editingIndex] = {
          title,
          content,
          date: notes[editingIndex].date, // 作成日時は維持
        };
        editingIndex = -1;
        addNoteBtn.textContent = "メモを追加";
      } else {
        // 新しいメモを追加
        const note = {
          title,
          content,
          date: new Date().toISOString(),
        };
        notes.unshift(note);
      }

      localStorage.setItem("notes", JSON.stringify(notes));
      noteTitle.value = "";
      noteContent.value = "";
      displayNotes();
    }
  }

  // メモ追加/更新ボタンのイベントリスナー
  addNoteBtn.addEventListener("click", addOrUpdateNote);

  // Enterキーでメモを追加/更新
  noteContent.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      addOrUpdateNote();
    }
  });

  // 初期表示
  displayNotes();
});
