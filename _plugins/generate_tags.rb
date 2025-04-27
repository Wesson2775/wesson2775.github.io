require 'jekyll'

module Jekyll
  class TagPageGenerator < Generator
    safe true
    def generate(site)
      all_tags = site.posts.docs.map { |post| post.data['tags'] }.flatten.uniq.compact
      all_tags.each do |tag|
        site.pages << TagPage.new(site, site.source, tag)
      end
    end
  end

  class TagPage < Page
    def initialize(site, base, tag)
      @site = site
      @base = base
      @dir  = File.join('tags', tag.to_s)
      @name = 'index.html'
      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'tag.html')
      self.data['tag'] = tag.to_s
      self.data['title'] = "标签: #{tag}"  # 默认中文标题，英文标题在 tag.html 中动态处理
    end
  end
end