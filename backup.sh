#!/bin/bash
# Respaldo completo de la Polla Mundial 2026 (4 tablas de Supabase).
# Uso: ./backup.sh   →  backups/AAAA-MM-DD_HHMMSS/ con un JSON por tabla.
#
# La tabla participants incluye los PINs, que tras el blindaje solo se
# leen con la contraseña de admin. Ponla en un archivo local (NO se sube
# a git):   echo "TU_CLAVE_ADMIN" > .adminpass
# o expórtala:   export ADMIN_PASS="TU_CLAVE_ADMIN"
cd "$(dirname "$0")"
[ -z "$ADMIN_PASS" ] && [ -f .adminpass ] && ADMIN_PASS="$(tr -d '\n\r' < .adminpass)"
ADMIN_PASS="$ADMIN_PASS" python3 - <<'EOF'
import json, urllib.request, os, datetime
SB="https://jgybhnyhdniwarnwolrs.supabase.co"
KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpneWJobnloZG5pd2FybndvbHJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNzg1NTYsImV4cCI6MjA5NDg1NDU1Nn0.vzFrYYw0042L4rI3P71WdZWH_n6h7A48344_CPeLgvU"
PASS=os.environ.get("ADMIN_PASS","")
H={"apikey":KEY,"Authorization":f"Bearer {KEY}","Content-Type":"application/json"}
ts=datetime.datetime.now().strftime("%Y-%m-%d_%H%M%S")
outdir=f"backups/{ts}"; os.makedirs(outdir, exist_ok=True)

def get(path, rng=None):
    h=dict(H);
    if rng: h["Range"]=rng
    return json.load(urllib.request.urlopen(urllib.request.Request(f"{SB}/rest/v1/{path}", headers=h)))

total=0
# participants CON PINs vía función de admin (si hay contraseña); si no, columnas públicas
if PASS:
    rows=json.load(urllib.request.urlopen(urllib.request.Request(
        f"{SB}/rest/v1/rpc/admin_list_participants",
        data=json.dumps({"p_pass":PASS}).encode(), headers=H)))
    tag="(con PINs)"
else:
    rows=get("participants?select=id,name,total_points,paid,breakdown,created_at")
    tag="(SIN PINs — define ADMIN_PASS o .adminpass para incluirlos)"
json.dump(rows, open(f"{outdir}/participants.json","w"), ensure_ascii=False, indent=1)
total+=len(rows); print(f"  participants: {len(rows)} filas {tag}")

for table in ("predictions","results","settings"):
    rows, off = [], 0
    while True:
        # order=id (único) para que la paginación sea estable: ordenar por
        # created_at repetía y omitía filas entre páginas.
        q = f"{table}?select=*&order=id" if table!="settings" else f"{table}?select=*"
        chunk=get(q, f"{off}-{off+999}")
        rows+=chunk
        if len(chunk)<1000: break
        off+=1000
    json.dump(rows, open(f"{outdir}/{table}.json","w"), ensure_ascii=False, indent=1)
    total+=len(rows); print(f"  {table}: {len(rows)} filas")
print(f"✅ Respaldo en {outdir} ({total} filas)")
EOF
