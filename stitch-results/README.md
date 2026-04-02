# Stitch Results

Carpeta para depositar los resultados de Stitch **descomprimidos** (NO en ZIP).

## Estructura esperada por tarea

Cada resultado de Stitch se coloca en una subcarpeta con el número de tarea:

```
stitch-results/
  0.0.1/          ← Onboarding
    index.html
    preview.png   (o .jpg)
    design.json   (opcional)
  1.1.1/          ← PerfilScreen
    index.html
    preview.png
    ...
```

## Flujo

1. Genero el prompt de Stitch
2. Usas Stitch y descargas el resultado
3. Descomprimes y colocas los archivos en la subcarpeta correspondiente
4. Me avisas que ya están listos
5. Los leo y continúo implementando
