import { api, type Catalog, type CatalogCase } from "./api"
import { pageQS } from "./page"

const CATALOG_PAGE_SIZE = 50

export async function loadCatalog(): Promise<Catalog> {
  let items: CatalogCase[] = []
  let page = 1
  for (;;) {
    const data = await api<Catalog>(`/api/catalog${pageQS({ page, page_size: CATALOG_PAGE_SIZE })}`)
    items = [...items, ...data.items]
    if (!data.has_more) return { ...data, items, page: 1, has_more: false }
    page += 1
  }
}
