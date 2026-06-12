#!/bin/bash
# Respaldo completo de la Polla Mundial 2026 (4 tablas de Supabase).
# Uso: ./backup.sh  →  crea backups/AAAA-MM-DD_HHMMSS/ con un JSON por tabla.
cd "$(dirname "$0")"
python3 - <<'EOF'
import json, urllib.request, os, datetime
SB="https://jgybhnyhdniwarnwolrs.supabase.co"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpneWJobnloZG5pd2FybndvbHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzg1NTYsImV4cCI6MjA5NDg1NDU1Nn0.vzFrYYw0042L4rI3P71WdZWH_n6h7A48344_CPeLgvU"
ts=datetime.datetime.now().strftime("%Y-%m-%d_%H%M%S")
outdir=f"backups/{ts}"
os.makedirs(outdir, exist_ok=True)
total=0
for table in ("participants","predictions","results","settings"):
    rows, offset = [], 0
    while True:  # pagina de 1000 (límite de Supabase)
        req=urllib.request.Request(f"{SB}/rest/v1/{table}?select=*&order=created_at" if table!="settings" else f"{SB}/rest/v1/{table}?select=*",
            headers={"apikey":KEY,"Authorization":f"Bearer {KEY}","Range":f"{offset}-{offset+999}"})
        chunk=json.load(urllib.request.urlopen(req))
        rows+=chunk
        if len(chunk)<1000: break
        offset+=1000
    json.dump(rows, open(f"{outdir}/{table}.json","w"), ensure_ascii=False, indent=1)
    total+=len(rows)
    print(f"  {table}: {len(rows)} filas")
print(f"✅ Respaldo en {outdir} ({total} filas)")
EOF
