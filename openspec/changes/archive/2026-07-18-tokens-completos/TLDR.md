# TLDR: completar el sistema de tokens de presentacion

## Proposal: por que hacemos este change

`src/themes/` hoy solo cubre color. Faltan los seis grupos de tokens que el plan exige para la Ola 0: espaciado (4pt), radios (8/12/16/pill), tipografia escalable, elevacion (3 niveles), movimiento (150/250ms) y z-index nombrado. Sin ellos cada pantalla decide tamanos, radios y sombras a mano: 95 archivos ya codifican `borderRadius` con literales. Ademas el movimiento tiene una brecha (H9): existen dos senales de reduce-motion (el ajuste del sistema y una preferencia in-app), pero ninguna primitiva que las unifique. Este change define la fundacion para que toda pantalla nueva sea consistente sin decisiones ad hoc.

## Design: como lo resolvemos

Un archivo por grupo mas un barrel `tokens.ts`. Lo estatico (espaciado, radios, movimiento, z-index) son constantes importables sin contexto. Lo que depende de runtime se consume desde la fabrica `getStyles` que ya existe: la tipografia se multiplica por `FontSizeContext` con un helper `scaleType`, y la elevacion toma su sombra de los colores del tema, asi cambia en claro y oscuro. Para reduce-motion adoptamos las APIs vigentes de reanimated (verificadas en Context7): un hook unico combina el ajuste del sistema (sincrono) con la preferencia in-app reactiva, y los tokens de movimiento honran el sistema en la capa worklet. No se toca `App.tsx` ni los contextos protegidos.

## Spec: que comportamiento queda garantizado

Existe un set unico de tokens en `src/themes/`, consumible desde la fabrica sin cambiar su contrato. La tipografia escala con el tamano de fuente del docente sin reiniciar. La elevacion difiere entre tema claro y oscuro y sus tres niveles son distinguibles. La primitiva de reduce-motion reporta activo cuando el sistema O la preferencia in-app lo piden, y las animaciones honran el ajuste del sistema en la capa de reanimated, con la salvedad del cambio a mitad de sesion documentada. El z-index es una escala nombrada y ascendente. Definir tokens no cambia ninguna pantalla existente ni agrega dependencias nuevas.

## Tasks: plan de trabajo

Primero los tokens estaticos (espaciado, radios, z-index) con pruebas de forma y orden. Luego movimiento y el hook de reduce-motion, con la salvedad del sistema documentada y pruebas del OR. Despues la tipografia base con el helper que multiplica por el factor de fuente, y la elevacion theme-aware con pruebas de que difiere entre temas. Se agrega el barrel y se confirma que los contratos y contextos no cambian. Al final, typecheck, lint, tests y validacion OpenSpec en verde, mas una pagina de preview de los tokens capturada por breakpoint como evidencia visual. `expo-blur` y la fuente de marca quedan diferidas por escrito.

## Resumen integral del change

Este change no redisena ni migra ninguna pantalla: establece la fundacion de tokens que desbloquea `componentes-base` y el resto de la Ola 1. Deja seis grupos de tokens consistentes, una tipografia que respeta el tamano de fuente del docente, una elevacion que respeta el tema y una primitiva de reduce-motion honesta que combina el ajuste del sistema (sobre reanimated v4) con la preferencia in-app, con su salvedad escrita. Documenta por escrito las decisiones diferidas de blur y fuente de marca, sin instalar nada nuevo. Lo que no cambia importa igual: las pantallas legacy, los tres contextos protegidos y las preferencias guardadas quedan intactos.
