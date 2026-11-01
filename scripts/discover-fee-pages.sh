#!/bin/bash
# Free tinyfish searches to find each card's fee/limits page, then pick best URL per site.
set -u
cd "$(dirname "$0")/.."
mkdir -p crawl/search

python3 - <<'EOF' > /tmp/search-jobs.txt
import json, re
for s in json.load(open('crawl/sites.json')):
    slug = s['website'].replace('www.','').replace('/','_').replace('.','_')
    brand = s['cards'][0].split(' - ')[0].replace(' Card','')
    q = f"{brand} crypto card fees limits cashback"
    print(f"{slug}\t{q}")
EOF

while IFS=$'\t' read -r slug q; do
  [ -s "crawl/search/$slug.json" ] && continue
  treg call treg.web.search --method POST \
    --header 'X-Treg-Route-Prefer: tinyfish' \
    --header 'X-Treg-Route-Waterfall: 0' \
    --data "{\"q\":\"$q\",\"limit\":5}" > "crawl/search/$slug.json" 2>/dev/null
  echo "$slug done"
  sleep 0.3
done < /tmp/search-jobs.txt
echo "--- search pass done ---"
