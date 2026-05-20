# 🔍 AUDITORÍA COMPLETA + PLAN DE ACCIÓN

---

## PARTE 1: BUGS FUNCIONALES (lo que no funciona)

### 🔴 CRÍTICOS

| # | Bug | Archivo | Línea |
|---|-----|---------|-------|
| 1 | **SettingsPanel.tsx no se usa** — Se creó el componente pero page.tsx sigue usando `renderSettings()` inline con su propio estado duplicado | `page.tsx` | 203-310 |
| 2 | **handleSaveSettings usa `settingsSaved` boolean** en vez de toast — el estado `settingsSaved` (line 145) se setea a true y se muestra texto verde (line 308), no se usa el toast system | `page.tsx` | 191-199 |
| 3 | **Duplicación de Settings** — `DEFAULT_SETTINGS` y `Settings` interface existen tanto en page.tsx (lines 19-46) como en SettingsPanel.tsx (lines 9-17) | `page.tsx` + `SettingsPanel.tsx` | — |
| 4 | **Fetch de settings duplicado** — page.tsx hace fetch en line 166-171 y SettingsPanel.tsx también | `page.tsx:166-171` | — |
| 5 | **Sin confirmación al borrar citas/clientes/estilistas** — Las funciones delete ya no tienen `confirm()` pero tampoco tienen ConfirmDialog. Borran directo sin preguntar | `AppointmentCalendar.tsx:99-105`, `ClientList.tsx`, `StylistSchedule.tsx` | — |
| 6 | **No hay feedback de carga en submit de forms** — Los botones de submit no tienen estado loading en la mayoría de los modales | `ClientList.tsx`, `StylistSchedule.tsx` | — |

### 🟡 MEDIOS

| # | Bug | Archivo | Línea |
|---|-----|---------|-------|
| 7 | **Sin manejo de error en fetch inicial** — Si falla `fetchSettings` en page.tsx solo hace `console.error` | `page.tsx:166-171` | — |
| 8 | **No hay refresh automático** — Los datos no se refrescan al volver a una tab (solo al montar componente) | Todos | — |
| 9 | **Token expirado sin redirect** — Si el token expira, api.ts hace `window.location.reload()` y el usuario ve un flash | `lib/api.ts:45` | — |
| 10 | **Sin tipos strictos** — `any` usado en todas las interfaces de props y estados | Todos | — |

---

## PARTE 2: PROBLEMAS DE DISEÑO

### 🎨 INCONSISTENCIAS VISUALES

| # | Problema | Detalle |
|---|----------|---------|
| 11 | **Fondos inconsistentes** — `body` es `#000000` pero page usa `bg-[#080608]`, Login usa `bg-[#080608]`, cards usan `--bg-secondary: #0A0A0A` | 4 variantes de negro |
| 12 | **Padding en cards** — app-card define `padding: 20px` pero componentes lo overrides con `p-4 sm:p-6`, `p-4 md:p-6`, `p-5 lg:p-7` | 4 variantes de padding |
| 13 | **Inputs con fondo hardcodeado** — `bg-[#15101a]` en selects (línea 279, 290) en vez de usar `--bg-tertiary` | `AppointmentCalendar.tsx` |
| 14 | **Bordes inconsistentes** — Algunos usan `border-white/5`, otros `border-[--line-medium]`, otros `border-white/10` | Todos los componentes |
| 15 | **Hover states inexistentes** — En tablas no hay hover en filas (solo en acciones), en el sidebar no hay hover highlight | Múltiples |
| 16 | **Empty states pobres** — Cuando no hay datos muestra "Sin análisis aún" con un icono genérico. No hay ilustraciones ni mensajes útiles | `TriageView.tsx` |
| 17 | **Loading states genéricos** — Todos usan `animate-pulse` con fondo semitransparente, sin esqueleto real | Todos |
| 18 | **Tabla de citas fea** — Sin zebra striping, sin bordes claros, muy plana | `AppointmentCalendar.tsx:193-257` |
| 19 | **Badge de estado sin icono** — Muestra texto "PENDING" sin indicador visual rápido | `AppointmentCalendar.tsx` |
| 20 | **Modales muy anchos** — Mismo ancho para crear cita (muchos campos) que para confirmar acción (poco contenido) | `Modal.tsx` |
| 21 | **Botón "Ver todas las citas" casi invisible** — Texto `text-white/50` apenas se ve | `AppointmentCalendar.tsx:261` |
| 22 | **Sidebar "Plan Activo" card** — Es información irrelevante que ocupa espacio | `Sidebar.tsx:78-87` |

### 📱 MOBILE

| # | Problema | Detalle |
|---|----------|---------|
| 23 | **Bottom nav muy pequeño** — 56px height, texto 10px. Difícil de tocar | `page.tsx:508-542` |
| 24 | **Modales full-height en mobile** — El Modal ocupa todo pero tiene border-radius solo arriba. OK pero el contenido tiene padding raro | `Modal.tsx:28` |
| 25 | **Safe area inconsistente** — Algunos componentes usan `env(safe-area-inset-bottom)`, otros no | Múltiples |

---

## PARTE 3: PLAN DE ACCIÓN — 8 FASES

### ⏱️ FASE 1: ARREGLAR BUGS CRÍTICOS (30 min)

| Tarea | Archivo |
|-------|---------|
| **1.1** Reemplazar `renderSettings()` inline con `<SettingsPanel />` | `page.tsx` |
| **1.2** Eliminar `settings`, `savingSettings`, `settingsSaved`, `appUrl`, `webhookUrl` de page.tsx | `page.tsx` |
| **1.3** Eliminar `DEFAULT_SETTINGS`, `Settings` interface de page.tsx | `page.tsx` |
| **1.4** Eliminar `fetchSettings`, `saveSettings` import de page.tsx | `page.tsx` |
| **1.5** Eliminar iconos no usados de page.tsx: `Eye`, `EyeOff`, `Building2`, `Phone`, `MapPin`, `Mail`, `Key`, `MessageSquare`, `Copy`, `CheckCircle` | `page.tsx` |
| **1.6** Añadir `loading` state a botones submit en modales de ClientList, StylistSchedule | Ambos |
| **1.7** Añadir ConfirmDialog antes de borrar appointments, clients, stylists | Los 3 componentes |

### 🎨 FASE 2: UNIFICAR DISEÑO (20 min)

| Tarea | Detalle |
|-------|---------|
| **2.1** Unificar fondo a `#000000` — quitar `#080608` de page.tsx container y Login | `page.tsx:383`, `Login.tsx:68` |
| **2.2** Reemplazar todos los `bg-white/[0.02]` y similares por `--bg-secondary` o `--bg-tertiary` | Todos los archivos |
| **2.3** Reemplazar todos los `border-white/5`, `border-white/10` por `--line-medium` y `--line-subtle` | Todos los archivos |
| **2.4** Unificar padding de cards a `--spacing-card: 20px` y usar consistente | Todos los archivos |
| **2.5** Eliminar `bg-[#15101a]` hardcodeado en selects → `--bg-tertiary` | `AppointmentCalendar.tsx` |

### 📋 FASE 3: TABLAS Y LISTAS (15 min)

| Tarea | Detalle |
|-------|---------|
| **3.1** Añadir zebra striping a tablas (even rows con `bg-[--bg-secondary]`) | `AppointmentCalendar.tsx`, `ClientList.tsx` |
| **3.2** Añadir hover highlight en filas (más visible) | Todos con tablas |
| **3.3** Hacer botones "Ver todos" más visibles (con border pill) | Todos |
| **3.4** Añadir badge con emoji a estados (✅ Confirmada, ⏳ Pendiente, ❌ Cancelada) | `AppointmentCalendar.tsx` |

### 📱 FASE 4: MOBILE (15 min)

| Tarea | Detalle |
|-------|---------|
| **4.1** Bottom nav: aumentar a 64px, iconos más grandes | `page.tsx:508-542` |
| **4.2** Modal: reducir padding en mobile, mejorar scroll | `Modal.tsx` |
| **4.3** Añadir swipe-to-close en modales mobile (touch event) | `Modal.tsx` |
| **4.4** Asegurar hit targets > 44px en todos los botones | Todos |

### 🧩 FASE 5: MEJORAR UX (15 min)

| Tarea | Detalle |
|-------|---------|
| **5.1** Añadir loading skeletons reales (shape de contenido, no caja gris) | Todos |
| **5.2** Añadir empty states con mensajes y acción (ej: "No hay citas. Crea la primera +") | Todos |
| **5.3** Añadir `refetchOnFocus` (refrescar datos cuando el usuario vuelve a la pestaña) | page.tsx |
| **5.4** Loading spinner en botón submit de todos los modales | Todos los modales |

### 🧹 FASE 6: CLEANUP (10 min)

| Tarea | Detalle |
|-------|---------|
| **6.1** Eliminar imports no usados en todos los archivos | Todos |
| **6.2** Eliminar el sidebar "Plan Activo" card (info irrelevante) | `Sidebar.tsx:78-87` |
| **6.3** Reemplazar `any` por tipos reales donde sea fácil | Varios |

### 🚀 FASE 7: VERIFICACIÓN (15 min)

| Tarea | Detalle |
|-------|---------|
| **7.1** Build con `npm run build` — arreglar errores | — |
| **7.2** Verificar que modales funcionan con Portal | — |
| **7.3** Verificar que toast reemplazó todos los `alert()` | — |
| **7.4** Commit y push | — |

### ⏱️ TOTAL ESTIMADO: ~2 horas

---

## ✅ APROBACIÓN

- [ ] ✅ **APROBADO** — Ejecutar todo
- [ ] ♻️ **APROBADO CON CAMBIOS** — Quieres modificar algo
- [ ] ❌ **RECHAZADO** — Hago otro approach
