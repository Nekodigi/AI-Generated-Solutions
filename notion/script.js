document.addEventListener("DOMContentLoaded", () => {
  const newPageBtn = document.getElementById("newPageBtn");
  const pageTree = document.getElementById("pageTree");
  const pageTitle = document.getElementById("pageTitle");
  const editor = document.getElementById("editor");
  const preview = document.getElementById("preview");
  const deleteBtn = document.getElementById("deleteBtn");

  let currentPageId = null;
  let pages = JSON.parse(localStorage.getItem("notion_pages") || "[]");

  // ページの保存
  function savePage() {
    if (!currentPageId) return;

    const pageIndex = pages.findIndex((p) => p.id === currentPageId);
    if (pageIndex === -1) return;

    pages[pageIndex].title = pageTitle.value;
    pages[pageIndex].content = editor.innerText;
    localStorage.setItem("notion_pages", JSON.stringify(pages));
    updatePageTree(); // ページツリーを更新
  }

  // ページの削除
  function deletePage() {
    if (!currentPageId) return;

    if (!confirm("このページを削除してもよろしいですか？")) return;

    const pageIndex = pages.findIndex((p) => p.id === currentPageId);
    if (pageIndex === -1) return;

    pages.splice(pageIndex, 1);
    localStorage.setItem("notion_pages", JSON.stringify(pages));

    if (pages.length === 0) {
      createNewPage();
    } else {
      loadPage(pages[0].id);
    }
  }

  // ページの読み込み
  function loadPage(pageId) {
    const page = pages.find((p) => p.id === pageId);
    if (!page) return;

    currentPageId = pageId;
    pageTitle.value = page.title;
    editor.innerText = page.content;
    updatePreview();
    updatePageTree();
  }

  // プレビューの更新
  function updatePreview() {
    preview.innerHTML = marked.parse(editor.innerText);
  }

  // ページツリーの更新
  function updatePageTree() {
    pageTree.innerHTML = "";
    pages.forEach((page) => {
      const pageItem = document.createElement("div");
      pageItem.className = `page-item ${
        page.id === currentPageId ? "active" : ""
      }`;
      pageItem.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
        </svg>
        <span>${page.title || "無題"}</span>
      `;
      pageItem.addEventListener("click", () => loadPage(page.id));
      pageTree.appendChild(pageItem);
    });
  }

  // 新規ページの作成
  function createNewPage() {
    const newPage = {
      id: Date.now().toString(),
      title: "",
      content: "",
      createdAt: new Date().toISOString(),
    };
    pages.push(newPage);
    localStorage.setItem("notion_pages", JSON.stringify(pages));
    loadPage(newPage.id);
  }

  // イベントリスナー
  newPageBtn.addEventListener("click", createNewPage);
  deleteBtn.addEventListener("click", deletePage);

  editor.addEventListener("input", () => {
    updatePreview();
    savePage();
  });

  pageTitle.addEventListener("input", () => {
    savePage();
  });

  // 初期表示
  updatePageTree(); // ページツリーを初期表示
  if (pages.length === 0) {
    createNewPage();
  } else {
    loadPage(pages[0].id);
  }
});
