# UI components

The dashboard and standalone report share the shadcn/ui `base-nova` components
under `ui/src/components/ui`. `ui/components.json` selects Base UI and Lucide.

| UI responsibility | Shared components |
| --- | --- |
| Selection | Select, Checkbox |
| Forms | Label, Input, Textarea, Button |
| Containers and status | Card / CardContent, Badge, Alert |
| Data tables | Table, TableHeader, TableBody, TableRow, TableHead, TableCell |
| Expandable evidence | Collapsible |
| Page navigation | Pagination with Button controls |
| Loading placeholders | Skeleton with page-specific layouts |

Application compositions:

- `SelectField` accepts typed option values and labels, calls `onValueChange`,
  and renders a shadcn Select popup. It does not synthesize native change events.
- `Disclosure` composes Collapsible and Button for keyboard-accessible report
  sections and evidence. `defaultOpen` supplies the initial expansion state.
- `ErrorAlert` composes Alert and AlertDescription for request/form errors.
- `Pager` uses Pagination with disabled Buttons for the first/last-page boundaries.
- `page-skeleton.tsx` composes Skeleton into overview, table, detail, configuration,
  and document layouts. Loading regions expose an accessible status; animations
  respect reduced-motion preferences.
- `useResource` takes a stable loader (a module function or `useCallback`). Changing
  the loader starts a new resource with skeletons; polling and manual refresh keep
  existing content visible. Failed requests expose errors, and responses from
  previous resources or unmounted pages are ignored. No artificial loading delay
  is added, so fast responses can show skeletons only briefly.

The Badge adds `pass`, `fail`, `skip`, and `running` variants to the official
component. Preserve these business states when updating it. Card layout belongs
inside CardContent; page spacing is supplied by the consuming page.

The main theme and standalone report theme both define popover colors and radius
tokens required by the imported components. The report build resolves `@` to
`ui/src`, so it bundles the same primitives instead of duplicate Card/Badge files.

PassBar (a three-part outcome distribution), Spark (metric series), IterStrip
(iteration states), and the logo remain domain-specific visualizations. They are
not substitutes for standard form controls or a single-value progress widget.

From `ui/`:

```bash
pnpm exec shadcn add <component>
pnpm test
pnpm build
pnpm build:report
```

Tests use jsdom to exercise selection, keyboard handling, disabled controls,
checkbox labels, disclosures, form submission, pagination, and report links.
They do not launch a browser or replace manual visual verification.
