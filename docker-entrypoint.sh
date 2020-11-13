#!/usr/bin/env bash
INDEX_TMP="/usr/share/nginx/html/index.html.tmp"
INDEX_DST="/usr/share/nginx/html/index.html"

mv ${INDEX_DST} ${INDEX_TMP}
envsubst < ${INDEX_TMP} > ${INDEX_DST}
rm ${INDEX_TMP}

exec "$@"
