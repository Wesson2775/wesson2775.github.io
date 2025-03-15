document.addEventListener('DOMContentLoaded', () => {
  const posts = [
  "友情链接.html",
  "二建实务 第一讲.html",
  "tianxia.html",
  "关于我.html",
  "xianggang.html",
  "如何进行胶片调色.html",
  "wutai.html",
  "第一讲.html",
  "如何快速处理大光比图片，保留细节不过曝.html"
];
  const postsPath = './posts/';
  const article = document.querySelector('.article');

  posts.forEach(post => {
    const filePath = postsPath + post;

    fetch(filePath)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const postDoc = parser.parseFromString(data, 'text/html');
        const blogContent = postDoc.getElementById('blog').textContent;
        const dateContent = postDoc.getElementById('date').textContent;

        const newP = document.createElement('p');
        const newA = document.createElement('a');
        newA.id = 'head';
        newA.href = filePath;
        newA.textContent = blogContent;

        const newSpan = document.createElement('span');
        newSpan.id = 'date';
        newSpan.textContent = dateContent;

        newP.appendChild(newA);
        newP.appendChild(document.createTextNode(' '));
        newP.appendChild(newSpan);

        article.appendChild(newP);
      });
  });
});
