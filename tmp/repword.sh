#!/bin/bash

# Verificar si se han proporcionado las palabras de origen y destino
if [ $# -ne 2 ]; then
	  echo "Uso: $0 palabra_origen palabra_destino"
	    exit 1
fi

ORIGEN=$1
DESTINO=$2
ORIGEN_CAP="${ORIGEN^}"
DESTINO_CAP="${DESTINO^}"

# Función para reemplazar texto en los archivos
replace_text() {
	  local file=$1
	    sed -i "s/$ORIGEN/$DESTINO/g" "$file"
	      sed -i "s/$ORIGEN_CAP/$DESTINO_CAP/g" "$file"
      }

# Recorrer todos los archivos y subdirectorios
find . -type f | while read -r file; do
  replace_text "$file"
    echo "Texto reemplazado en: $file"
done

