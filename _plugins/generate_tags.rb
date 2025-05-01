require 'jekyll'

puts "=== 标签生成插件开始加载 ==="

module Jekyll
  class TagPageGenerator < Generator
    safe true
    
    def generate(site)
      puts "=== 开始生成标签页 ==="
      
      # 获取所有文章的标签
      all_tags = site.posts.docs.flat_map { |post| post.data['tags'] || [] }.compact.uniq
      puts "找到的标签: #{all_tags.inspect}"
      
      # 为每个标签生成页面
      all_tags.each do |tag|
        site.pages << TagPage.new(site, site.source, tag)
        puts "已生成标签页: #{tag}"
      end
      
      puts "=== 标签页生成完成 ==="
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
      self.data['title'] = "标签: #{tag}"
      
      puts "创建标签页: #{@dir}/#{@name}"
    end
  end
end