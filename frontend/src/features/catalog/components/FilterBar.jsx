import NiceSelect from '../../../components/ui/NiceSelect'
import Pagination from '../../../components/ui/Pagination'
import { perPageOptions, sortOptions } from '../search-params'

const showOptions = perPageOptions.map((n) => ({ value: n, label: `Show ${n}` }))

/** Sorting / page-size / pagination bar shown above and below the product grid. */
export default function FilterBar({ sort, perPage, onChange, meta, hrefFor, withSort = true }) {
  return (
    <div className="filter-bar d-flex flex-wrap align-items-center">
      {withSort && (
        <div className="sorting">
          <NiceSelect value={sort} options={sortOptions} onChange={(v) => onChange({ sort: v })} />
        </div>
      )}
      <div className="sorting mr-auto">
        <NiceSelect value={perPage} options={showOptions} onChange={(v) => onChange({ perPage: v })} />
      </div>
      {meta && <Pagination page={meta.page} lastPage={meta.lastPage} hrefFor={hrefFor} />}
    </div>
  )
}
