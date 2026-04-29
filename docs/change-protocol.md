# Protocolo de cambios significativos

Para migraciones, refactors, optimizaciones, o cualquier cambio que toque más de 5 archivos.

## Fase de análisis (NO tocar código)

1. **Investigar** — documentación oficial, breaking changes, evaluar consejos externos contra nuestro stack. Descartar lo que no aplica con justificación.
2. **Auditar impacto** — búsqueda exhaustiva en el codebase: qué archivos, qué líneas, cuántas ocurrencias. Generar tabla de impacto con conteos exactos.
3. **Anticipar efectos** — para cada cambio planificado, responder:
   - ¿Qué valor/comportamiento tiene HOY?
   - ¿Qué valor/comportamiento tendrá DESPUÉS?
   - ¿Son idénticos? Si no, ¿qué se rompe visualmente o funcionalmente?
   - ¿Hay efectos colaterales en otros componentes que consumen esto?
4. **Verificar con prueba aislada** — si hay duda sobre un valor (CSS, API, output), crear un componente/archivo temporal de prueba para confirmar ANTES de modificar el código real.

## Fase de planificación (NO tocar código)

5. **Planificar por fases** — ordenar de menor a mayor riesgo. Cada fase incluye:
   - Archivos a modificar con cambios concretos
   - Efecto esperado (qué cambia, qué se mantiene igual)
   - Criterio de verificación (cómo confirmar que funcionó)
   - Rollback: qué revertir si falla
6. **Presentar plan para aprobación** — el usuario revisa y aprueba antes de ejecutar.

## Fase de ejecución (ahora sí tocar código)

7. **Ejecutar fase por fase** — entre cada fase verificar:
   - Servidor arranca sin errores (HTTP 200)
   - El cambio específico se refleja (CSS generado, HTML, runtime)
   - Sin regresiones en funcionalidad existente
8. **Build de producción** — `npm run build` exitoso antes de commitear.
9. **Documentar** — actualizar CLAUDE.md si cambia stack, APIs, o patrones.
