import re,json
h=open('index.dev.html').read()
h=h.replace('<link rel="stylesheet" href="src/styles.css">','<style>\n'+open('src/styles.css').read()+'\n</style>')
def rep(m): return '<script>\n'+open(m.group(1)).read()+'\n</script>'
def mod(m): return '<script type="module">\n'+open(m.group(1)).read()+'\n</script>'
h=re.sub(r'<script type="module" src="(src/[^"]+)"></script>',mod,h)
h=re.sub(r'<script src="(src/[^"]+)"></script>',rep,h)
open('docs/index.html','w').write(h)
json.dump({"name":"OraGym","short_name":"OraGym","lang":"pt-BR","start_url":"./","scope":"./","display":"standalone","background_color":"#0B0B0B","theme_color":"#0B0B0B",
  "icons":[{"src":"photos/brand/icon-192.png","sizes":"192x192","type":"image/png"},{"src":"photos/brand/icon-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}]},open('docs/manifest.webmanifest','w'),ensure_ascii=False,indent=1)
print(len(h))
