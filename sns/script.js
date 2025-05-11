// DOM要素
const usernameElement = document.getElementById("username");
const loginBtn = document.getElementById("loginBtn");
const postContent = document.getElementById("postContent");
const postBtn = document.getElementById("postBtn");
const timeline = document.getElementById("timeline");
const loginModal = document.getElementById("loginModal");
const loginUsername = document.getElementById("loginUsername");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

// ローカルストレージからデータを取得
let posts = JSON.parse(localStorage.getItem("posts")) || [];
let currentUser = localStorage.getItem("currentUser") || "ゲスト";

// ユーザー名の表示を更新
usernameElement.textContent = currentUser;

// 投稿の表示
function displayPosts() {
  timeline.innerHTML = "";
  posts.forEach((post, index) => {
    const postElement = document.createElement("div");
    postElement.className = "post";
    postElement.innerHTML = `
            <div class="post-header">
                <span>${post.username}</span>
                <span>${new Date(post.timestamp).toLocaleString()}</span>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <button onclick="likePost(${index})">❤️ ${post.likes}</button>
                <button onclick="deletePost(${index})">🗑️</button>
            </div>
        `;
    timeline.appendChild(postElement);
  });
}

// 投稿の追加
function addPost() {
  if (postContent.value.trim() === "") return;

  const post = {
    username: currentUser,
    content: postContent.value,
    timestamp: new Date().toISOString(),
    likes: 0,
  };

  posts.unshift(post);
  localStorage.setItem("posts", JSON.stringify(posts));
  postContent.value = "";
  displayPosts();
}

// いいね機能
function likePost(index) {
  posts[index].likes++;
  localStorage.setItem("posts", JSON.stringify(posts));
  displayPosts();
}

// 投稿の削除
function deletePost(index) {
  if (posts[index].username === currentUser) {
    posts.splice(index, 1);
    localStorage.setItem("posts", JSON.stringify(posts));
    displayPosts();
  }
}

// ログインモーダルの表示
function showLoginModal() {
  loginModal.style.display = "block";
}

// ログインモーダルの非表示
function hideLoginModal() {
  loginModal.style.display = "none";
}

// ログイン処理
function login() {
  const username = loginUsername.value.trim();
  if (username) {
    currentUser = username;
    localStorage.setItem("currentUser", username);
    usernameElement.textContent = username;
    hideLoginModal();
    loginUsername.value = "";
  }
}

// イベントリスナーの設定
loginBtn.addEventListener("click", showLoginModal);
postBtn.addEventListener("click", addPost);
loginSubmitBtn.addEventListener("click", login);
closeModalBtn.addEventListener("click", hideLoginModal);

// Enterキーで投稿
postContent.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    addPost();
  }
});

// 初期表示
displayPosts();
