import re,sys
h=open('index.dev.html').read()
h=h.replace('<link rel="stylesheet" href="src/styles.css">','<style>\n'+open('src/styles.css').read()+'\n</style>')
def rep(m): return '<script>\n'+open(m.group(1)).read()+'\n</script>'
h=re.sub(r'<script src="(src/[^"]+)"></script>',rep,h)
open('docs/index.html','w').write(h); print(len(h))
