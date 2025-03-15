document.addEventListener('DOMContentLoaded', () => {
  const posts = [
    'wutai.html',
    'xianggang.html',
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