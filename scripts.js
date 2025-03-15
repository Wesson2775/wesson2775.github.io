document.addEventListener("DOMContentLoaded", () => {const posts = [
  "关于我.html",
  "友情链接.html",
  "如何快速处理大光比图片，保留细节不过曝.html",
  "如何进行胶片调色.html",
  "第一讲.html"
];const postsPath = "./posts/";const article = document.querySelector(".article");posts.forEach(post => {const filePath = postsPath + post;fetch(filePath).then(async response => {const text = await response.text();const parser = new DOMParser();const doc = parser.parseFromString(text, "text/html");const blogContent = doc.getElementById("blog")?.textContent;const dateContent = doc.getElementById("date")?.textContent;if (!blogContent) return;const newP = document.createElement("p");const newA = document.createElement("a");newA.id = "head";newA.href = filePath;newA.textContent = blogContent;const newSpan = document.createElement("span");newSpan.id = "date";newSpan.textContent = dateContent;newP.appendChild(newA);newP.appendChild(document.createTextNode(" "));newP.appendChild(newSpan);article.appendChild(newP);}).catch(error => {console.error("加载" + post + "时出错:", error);});});});