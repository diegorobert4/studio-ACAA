@AGENTS.md

# Studio ACAA — Portafolio de arquitectura

Sitio portafolio para un estudio de arquitectura. Dos vistas: **Inicio** (pública) y **Admin** (privada, sin auth todavía). Todo el estado vive en memoria de React — no hay backend ni base de datos real.

## Stack

- **Next.js 16.3.5** (App Router). Ver nota en `AGENTS.md`: esta versión difiere de lo que conoces por entrenamiento — antes de tocar convenciones de Next (routing, `params`, metadata, config), revisá `node_modules/next/dist/docs/`.
- **React 19.2.8** / **react-dom 19.2.8**
- **TypeScript 5** (`strict: true`)
- **lucide-react** — íconos (`ChevronLeft`, `ArrowDown`, `Upload`, `X`, etc.)
- CSS: **CSS Modules** puros (`*.module.css`), sin Tailwind ni librería de UI
- ESLint 9 (`eslint-config-next`)
- Alias de import: `@/*` → `src/*`

No hay: backend/API routes, base de datos, autenticación, gestor de estado global (Redux/Zustand/Context), ni librería de formularios/validación.

## Estructura de carpetas

```
src/
  app/
    layout.tsx              # Root layout, metadata global, importa globals.css
    page.tsx                 # Vista Inicio (client component)
    page.module.css
    globals.css               # Reset, variables CSS (colores, spacing, radius), fuente Inter
    admin/
      layout.tsx              # Layout del admin: Sidebar + header con botón "Ver sitio"
      layout.module.css
      page.tsx                 # /admin → renderiza <ProjectList />
      projects/[id]/page.tsx    # /admin/projects/[id] y /admin/projects/new → <ProjectEditor id={id} />
  components/
    public/                  # Componentes de la vista Inicio
      Navbar.tsx               # Nav fija con "Inicio" / "Admin" (falta "Contacto" real y estilo flotante/transparente descrito en el brief)
      ProjectSection.tsx        # Sección full-screen por proyecto: carrusel horizontal, dots, flechas, botón "Ver información"
      ProjectModal.tsx          # Modal de detalle de proyecto (todos los campos del brief)
      ContactSection.tsx        # Formulario de contacto (sin lógica de envío)
    admin/                   # Componentes de la vista Admin
      Sidebar.tsx               # Nav lateral: "Proyectos" activo; "Información del estudio" y "Acceso y seguridad" son links muertos (href="#")
      ProjectList.tsx           # Tabla de proyectos con reordenar (subir/bajar), editar, eliminar
      ProjectEditor.tsx         # Form de alta/edición con todos los campos + gestión de imágenes (reordenar/eliminar; sin upload real)
  data.ts                   # Fuente de datos única: tipos Project/ProjectImage/ProjectStatus + initialProjects (mock hardcodeado)
```

Cada componente `X.tsx` tiene su `X.module.css` hermano — convención 1:1, sin excepciones.

## Manejo de estado y datos

- **No hay fetching ni backend.** `src/data.ts` exporta `initialProjects`, un array hardcodeado que se importa directamente tanto en la vista pública (`page.tsx`) como en el admin (`ProjectList.tsx`, `ProjectEditor.tsx`).
- Cada vista mantiene su **propia copia local** en `useState(initialProjects)` — no comparten estado entre sí ni persisten cambios. Recargar la página o navegar entre `/` y `/admin` descarta cualquier edición.
- `ProjectEditor.saveProject()` solo hace `console.log(project)` y navega a `/admin` — no hay `POST`/`PUT` real, ni API routes, ni escritura a `data.ts` ni a ninguna DB.
- No hay `fetch`, `Server Actions`, ni React Query/SWR en el proyecto.
- El modelo de datos (`src/data.ts`) sí cubre todos los campos del brief: `title`, `architects`, `associatedArchitects`, `collaborators`, `location`, `status`, `area`, `year`, `instagramUrl`, `partnerLinks[]`, `publications[]`, `images[]` (con `order`).

## Componentes clave

- **`ProjectSection`** — pieza central de Inicio. Carrusel horizontal por scroll nativo (`scrollLeft` + `scrollIntoView`), calcula el índice activo con `Math.round(scrollLeft / clientWidth)`. Botones prev/next se ocultan en los extremos vía clase condicional, no `disabled`.
- **`ProjectModal`** — no es un `<dialog>` ni usa portal/librería; es un `div` fijo que se muestra/oculta con una clase (`infoModalOpen`) controlada por `project !== null` en `page.tsx`.
- **`ProjectList`** / **`ProjectEditor`** — reordenamiento hecho a mano con swap de índices en el array (sin drag-and-drop real pese a que los botones se llaman `dragHandle`/`imageDragHandle`).
- **`Home` (`page.tsx`)** — orquesta el scroll entre secciones vía `containerRef.current.children`, indexando manualmente (`index + 2`: navbar + siguiente sección). Frágil si cambia el orden de hijos del `<main>`.

## Convenciones de código

- Componentes de cliente marcados explícitamente con `'use client'` en la primera línea cuando usan hooks/estado (`page.tsx`, `ProjectSection`, `ProjectModal` no lo necesita porque no tiene estado propio, `ProjectList`, `ProjectEditor`).
- Componentes de función con `export default function NombreComponente(...)`, sin memo/forwardRef.
- Props tipadas con `interface NombreProps` justo arriba del componente.
- Estilos: siempre CSS Modules importados como `styles`, nunca inline salvo casos puntuales ya presentes en `ProjectEditor` (estilos inline para íconos sueltos).
- Textos de UI en **español** (es el idioma del sitio, `<html lang="es">`).
- Iconografía: siempre `lucide-react`, tamaño pasado por prop `size`.
- Sin tests configurados (no hay Jest/Vitest/Playwright en `package.json`).

## Estado de avance

### Vista Inicio — mayormente implementada
- ✅ Scroll vertical con una sección full-screen por proyecto
- ✅ Carrusel horizontal de imágenes por proyecto con dots y flechas
- ✅ Botón "Ver información" → modal con todos los campos del brief
- ✅ Flecha para pasar a la siguiente sección
- ✅ Sección de contacto al final (formulario sin lógica de envío — `submitBtn` es `type="button"`, no hace nada)
- ⚠️ Navbar: existe pero es básica (`Navbar.tsx`) — enlaza a "Inicio" y "Admin", **no** a "Contacto" como pide el brief; falta confirmar si el estilo transparente/flotante está bien resuelto en `Navbar.module.css` (no auditado a nivel visual, solo estructura)
- ❌ Sin conexión a datos reales/backend: todo viene de `initialProjects`

### Vista Administrador — esqueleto funcional, sin persistencia
- ✅ Listado de proyectos con reordenar (subir/bajar), editar, eliminar (solo en memoria)
- ✅ Formulario de creación/edición con todos los campos del brief
- ✅ UI de gestión de fotos: reordenar y eliminar
- ❌ Sin subida real de imágenes: el área de upload (`imageUploadArea`) es solo visual, sin `<input type="file">` ni handler
- ❌ Sin guardado real: `saveProject()` solo hace `console.log` y redirige
- ❌ Sin autenticación/protección de rutas: `/admin` es públicamente accesible
- ❌ Sidebar: "Información del estudio" y "Acceso y seguridad" son enlaces muertos (`href="#"`), secciones no implementadas

### Pendiente transversal (para persistencia real)
No hay backend ni DB. Para que Admin e Inicio compartan datos y las ediciones persistan, hace falta introducir alguna de: API routes de Next + storage (archivo, KV, SQL), o un backend externo. Ninguna decisión al respecto está tomada aún en el código.
