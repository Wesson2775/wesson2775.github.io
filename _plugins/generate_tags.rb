module Jekyll
  class TagPageGenerator < Generator
    safe true

    def generate(site)
      tags = site.posts.docs.flat_map { |post| post.data['tags'] || [] }.uniq
      tags.each do |tag|
        # 为中文和英文分别生成标签页面
        ['zh', 'en'].each do |lang|
          # 只生成与语言匹配的标签页面
          posts = site.posts.docs.select { |post| post.data['lang'] == lang && post.data['tags']&.include?(tag) }
          next if posts.empty? # 跳过没有文章的标签

          # 创建标签页面
          site.pages << TagPage.new(site, site.source, File.join('tags', tag), tag, lang)
        end
      end
    end
  end

  class TagPage < Page
    def initialize(site, base, dir, tag, lang)
      super(site, base, dir, 'index.html')
      self.data = {}
      self.data['layout'] = 'tag'
      self.data['tag'] = tag
      self.data['lang'] = lang
      self.data['title'] = "标签: #{tag}"
    end
  end
end