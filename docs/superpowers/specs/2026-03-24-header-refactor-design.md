# Header Refactor Design

**Date:** 2026-03-24
**Status:** Approved
**Author:** Claude

## Overview

Remover títulos de página e botões de ação dos headers (mobile e desktop) e movê-los para dentro do conteúdo de cada página. Os headers passarão a mostrar apenas o nome do sistema e botões globais (notificações, configurações).

## Current State

### Mobile Header (`AppHeader`)
- Shows page title, subtitle, and icon via props
- Shows action buttons via prop
- Menu hamburger on left
- Company name as fallback when no title

### Desktop Header (`DesktopHeader`)
- Shows page title (calculated from pathname)
- Shows action buttons via `HeaderContext`
- Notification and settings buttons

### Page Structure
- Pages use `<AppHeader title="..." action="...">` (mobile)
- Pages use `<SetHeaderAction action="...">` (desktop)
- Duplicate logic for mobile/desktop headers

## Problems

1. **Duplication:** Each page defines title/actions twice (mobile header props + desktop context)
2. **Inflexibility:** Header layout is fixed, pages can't customize their content area
3. **Context overhead:** `HeaderContext` exists only to pass action buttons to desktop header
4. **Tight coupling:** Pages are tightly coupled to header structure

## Design

### New Header Structure

#### AppHeader (Mobile)

```tsx
interface AppHeaderProps {
  companyName: string
  user: {
    name?: string
    email?: string
  }
}
```

Layout:
```
┌─────────────────────────────────────────┐
│ [☰]  🐾 Agenda Pet Shop        [🔔][⚙️] │
└─────────────────────────────────────────┘
```

#### DesktopHeader

```tsx
interface DesktopHeaderProps {
  user?: {
    name?: string
    email?: string
  }
}
```

Layout:
```
┌─────────────────────────────────────────────────────────┐
│ 🐾 Agenda Pet Shop                       [🔔][⚙️]       │
└─────────────────────────────────────────────────────────┘
```

### Removed Components

- `header-context.tsx` - No longer needed
- `set-header-action.tsx` - No longer needed
- `HeaderProvider` wrapper in `app-layout.tsx` - No longer needed

### Page Structure

Pages now include their own headers inline:

```tsx
<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
  {/* Page Header - Inline */}
  <div className="mb-6">
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">📅</span>
          Agendamentos
        </h1>
        <p className="text-purple-200/60 mt-1">
          {appointments?.length || 0} agendamentos
        </p>
      </div>
      <Link href="/app/agendamentos/novo">
        <Button variant="primary" size="sm" className="rounded-full">
          <Calendar size={16} className="mr-2" />
          Novo
        </Button>
      </Link>
    </div>
  </div>

  {/* Page content */}
</main>
```

## Migration Strategy

### Phase 1: Infrastructure (non-breaking)

1. Modify `AppHeader` - simplify props, keep company name and user
2. Modify `DesktopHeader` - remove `getPageTitle()` and `useHeaderAction()`
3. Test build

### Phase 2: Migrate Pages

4. Migrate 2-3 pages as examples
5. Test mobile and desktop
6. Continue migrating remaining pages
7. Test all pages

### Phase 3: Cleanup

8. Remove deprecated code from headers
9. Delete `header-context.tsx` and `set-header-action.tsx`
10. Remove `HeaderProvider` from `app-layout.tsx`
11. Final testing

### Files to Modify

**Layout Components:**
- `src/components/layout/app-header.tsx`
- `src/components/layout/desktop-header.tsx`
- `src/components/layout/header-context.tsx` (DELETE)
- `src/components/layout/set-header-action.tsx` (DELETE)
- `src/components/layout/app-layout.tsx`

**Pages (18 total):**
- `/app/page.tsx`
- `/app/agendamentos/page.tsx`
- `/app/agendamentos/novo/page.tsx`
- `/app/agendamentos/[id]/page.tsx`
- `/app/clientes/page.tsx`
- `/app/clientes/novo/page.tsx`
- `/app/clientes/[id]/page.tsx`
- `/app/clientes/[id]/pets/[petId]/page.tsx`
- `/app/pets/page.tsx`
- `/app/pets/novo/page.tsx`
- `/app/pets/[id]/page.tsx`
- `/app/servicos/page.tsx`
- `/app/servicos/novo/page.tsx`
- `/app/servicos/[id]/page.tsx`
- `/app/pacotes/page.tsx`
- `/app/pacotes/novo/page.tsx`
- `/app/pacotes/[id]/editar/page.tsx`
- `/app/perfil/page.tsx`
- `/app/ajuda/page.tsx`

## Benefits

1. **Simplicity:** No context overhead, direct prop passing
2. **Flexibility:** Each page has full control over its header layout
3. **Consistency:** Headers are identical across all pages (company name + global actions)
4. **Maintainability:** Less code, fewer concepts to understand
5. **No duplication:** Single header definition per page

## Testing Checklist

- [ ] Mobile header shows company name
- [ ] Mobile header has notification and settings buttons
- [ ] Desktop header shows company name
- [ ] Desktop header has notification and settings buttons
- [ ] All list pages show inline title with count
- [ ] All list pages have inline action button
- [ ] All detail pages show inline title with entity name
- [ ] All form pages show inline title with back button
- [ ] Mobile scrolling works correctly with inline headers
- [ ] Desktop layout is consistent across all pages
