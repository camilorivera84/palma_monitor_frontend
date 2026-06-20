$files = Get-ChildItem -Path "." -Recurse -Include *.jsx, *.js

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Verificar si el archivo usa localhost
    if ($content -match 'http://localhost:5000') {
        # Verificar si ya importa API_URL
        if ($content -notmatch "import.*API_URL.*config") {
            # Agregar importación al inicio
            $content = "import { API_URL } from '../config';`n" + $content
        }
        
        # Reemplazar todas las ocurrencias
        $content = $content -replace 'http://localhost:5000', '${API_URL}'
        
        Set-Content $file.FullName -Value $content
        Write-Host "✅ Actualizado: $($file.Name)"
    }
}
