#!/bin/bash
# Recrawl card sites via treg.web.extract (tinyfish free -> crawl4ai ~$0.00015 fallback)
# Usage: bash scripts/recrawl-cards.sh
set -u
cd "$(dirname "$0")/.."
mkdir -p crawl/pages crawl/raw

# unique site list
python3 - <<'EOF'
import json
d = json.load(open('crawl-targets.json'))
seen = {}
for c in d:
    seen.setdefault(c['website'], []).append(c['name'])
sites = [{'website': w, 'cards': n} for w, n in seen.items()]
json.dump(sites, open('crawl/sites.json', 'w'), indent=1)
print(len(sites), 'unique sites')
EOF

fetch() {
  local url="$1" out="$2"
  treg call treg.web.extract --method POST \
    --header 'X-Treg-Route-Exclude: tinyfish' \
    --header 'X-Treg-Route-Max-Cost: 0.005' \
    --data "{\"url\":\"$url\"}" > "crawl/raw/$out.json" 2>/dev/null
  python3 - "$out" <<'EOF'
import json, sys, re
out = sys.argv[1]
try:
    raw = open(f'crawl/raw/{out}.json').read()
    d = json.loads(raw[raw.index('{'):])
except Exception as e:
    print(f'{out}: parse fail {e}'); sys.exit()
pages = d.get('output', {}).get('pages', [])
txt = '\n\n'.join(p.get('markdown','') for p in pages)
open(f'crawl/pages/{out}.md','w').write(txt)
served = (d.get('_treg') or {}).get('served_by','?')
print(f'{out}: {len(txt)} chars via {served}')
EOF
}

python3 - <<'EOF' > /tmp/site-urls.txt
import json
for s in json.load(open('crawl/sites.json')):
    w = s['website']
    slug = w.replace('www.','').replace('/','_').replace('.','_')
    print(f"{slug}\thttps://{w}")
EOF

while IFS=$'\t' read -r slug url; do
  [ -s "crawl/pages/$slug.md" ] && continue
  fetch "$url" "$slug"
  sleep 0.3
done < /tmp/site-urls.txt
echo "--- homepage pass done ---"
wc -c crawl/pages/*.md | tail -1
