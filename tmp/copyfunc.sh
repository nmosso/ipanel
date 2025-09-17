#!/bin/bash

# Directorio raíz
ROOT_DIR="."

# Nombre a buscar y nombre nuevo
OLD_NAME=$1
NEW_NAME=$2

# Función para copiar y renombrar archivos y directorios
copy_and_rename() {
	  local src=$1
	    local dst=${src//$OLD_NAME/$NEW_NAME}

	    # Crear directorio si no existe
	      if [ -d "$src" ]; then
		      	mkdir -p "$dst"
			  fi

			        # Copiar archivo y renombrar
				      if [ -f "$src" ]; then
					                  cp "$src" "$dst"
							              fi
								              }

								            # Recorrer todos los archivos y directorios en el directorio raíz
									          find $ROOT_DIR -name "*$OLD_NAME*" | while read item; do
										          copy_and_rename "$item"
											        done

												      # Renombrar los archivos dentro de los nuevos directorios creados
												            find $ROOT_DIR -name "*$OLD_NAME*" -type d | while read dir; do
													          new_dir=${dir//$OLD_NAME/$NEW_NAME}
														        find "$new_dir" -type f | while read file; do
															        new_file=${file//$OLD_NAME/$NEW_NAME}
																          mv "$file" "$new_file"
																	            done
																		          done          
