/**
 * Visningene i en boligvelger danner et tre: oversikt → bygg → etasje.
 * Søsken sorteres på sort_order. Visninger med samme vinkelgruppe under samme
 * forelder er ulike vinkler av det samme, og kjøperen kan bla mellom dem.
 */

export type ViewNode = { id: string; parentViewId: string | null; sortOrder: number; angleGroup: string | null };

export type FlatView<T extends ViewNode> = { view: T; depth: number; parentId: string | null };

/** Forelderen, eller null hvis forelderen ikke finnes (da ligger visningen øverst). */
function parentOf<T extends ViewNode>(view: T, ids: ReadonlySet<string>): string | null {
  return view.parentViewId && ids.has(view.parentViewId) && view.parentViewId !== view.id ? view.parentViewId : null;
}

/** Treet flatet ut ovenfra og ned, med dybde. Sykler i dataene kan ikke gi evig løkke. */
export function flattenViews<T extends ViewNode>(views: readonly T[]): FlatView<T>[] {
  const ids = new Set(views.map((view) => view.id));
  const children = new Map<string | null, T[]>();
  views.forEach((view) => {
    const parent = parentOf(view, ids);
    children.set(parent, [...(children.get(parent) ?? []), view]);
  });
  for (const list of children.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const result: FlatView<T>[] = [];
  const seen = new Set<string>();
  const visit = (parent: string | null, depth: number) => {
    for (const view of children.get(parent) ?? []) {
      if (seen.has(view.id)) {
        continue;
      }
      seen.add(view.id);
      result.push({ view, depth, parentId: parent });
      visit(view.id, depth + 1);
    }
  };
  visit(null, 0);
  // Visninger som bare er nåbare via en sykel, legges til slutt i stedet for å forsvinne.
  for (const view of views) {
    if (!seen.has(view.id)) {
      seen.add(view.id);
      result.push({ view, depth: 0, parentId: null });
    }
  }
  return result;
}

/** Id-ene til alle visninger under en visning (barn, barnebarn osv.). */
export function descendantIds(views: readonly ViewNode[], viewId: string): Set<string> {
  const result = new Set<string>();
  let frontier = [viewId];
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const view of views) {
      if (view.parentViewId && frontier.includes(view.parentViewId) && !result.has(view.id) && view.id !== viewId) {
        result.add(view.id);
        next.push(view.id);
      }
    }
    frontier = next;
  }
  return result;
}

/** Stien fra øverste visning ned til denne (brødsmuler). */
export function viewPath<T extends ViewNode>(views: readonly T[], viewId: string): T[] {
  const byId = new Map(views.map((view) => [view.id, view]));
  const path: T[] = [];
  const seen = new Set<string>();
  let current = byId.get(viewId);
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift(current);
    current = current.parentViewId ? byId.get(current.parentViewId) : undefined;
  }
  return path;
}

/** Andre vinkler av samme visning: samme vinkelgruppe og samme forelder, i rekkefølge. Tom liste uten vinkelgruppe. */
export function angleSiblings<T extends ViewNode>(views: readonly T[], viewId: string): T[] {
  const view = views.find((item) => item.id === viewId);
  if (!view?.angleGroup) {
    return [];
  }
  return views
    .filter((item) => item.angleGroup === view.angleGroup && (item.parentViewId ?? null) === (view.parentViewId ?? null))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Flytter en visning til plassen til en annen visning med samme forelder.
 * Svarer med alle visningene med ny sort_order (1, 2, 3 … i treets rekkefølge),
 * eller null hvis flyttingen ikke er lov (ulik forelder).
 */
export function moveView<T extends ViewNode>(views: readonly T[], activeId: string, overId: string): T[] | null {
  if (activeId === overId) {
    return null;
  }
  const flat = flattenViews(views);
  const active = flat.find((item) => item.view.id === activeId);
  const over = flat.find((item) => item.view.id === overId);
  if (!active || !over || active.parentId !== over.parentId) {
    return null;
  }
  const siblings = flat.filter((item) => item.parentId === active.parentId).map((item) => item.view);
  const from = siblings.findIndex((view) => view.id === activeId);
  const to = siblings.findIndex((view) => view.id === overId);
  const reordered = [...siblings];
  const [moved] = reordered.splice(from, 1);
  if (!moved) {
    return null;
  }
  reordered.splice(to, 0, moved);
  const siblingOrder = new Map(reordered.map((view, index) => [view.id, index]));
  // Søsknene får midlertidig sortering etter ny plass; resten beholder sin.
  const resorted = views.map((view) =>
    siblingOrder.has(view.id) ? { ...view, sortOrder: -1_000_000 + (siblingOrder.get(view.id) ?? 0) } : view,
  );
  return flattenViews(resorted).map((item, index) => ({ ...item.view, sortOrder: index + 1 }));
}
