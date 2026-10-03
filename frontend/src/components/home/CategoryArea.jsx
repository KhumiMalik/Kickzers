import { categoryTiles } from '../../data/site'
import { useLightbox } from '../../hooks/useLightbox'

function Tile({ tile, onOpen }) {
  return (
    <div className="single-deal">
      <div className="overlay"></div>
      <img className="img-fluid w-100" src={tile.image} alt={tile.title} />
      <a href={tile.image} className="img-pop-up" onClick={onOpen}>
        <div className="deal-details">
          <h6 className="deal-title">{tile.title}</h6>
        </div>
      </a>
    </div>
  )
}

// Fixed mosaic layout from the template: wide/narrow/narrow/wide + one tall tile.
const layout = ['col-lg-8 col-md-8', 'col-lg-4 col-md-4', 'col-lg-4 col-md-4', 'col-lg-8 col-md-8']

export default function CategoryArea() {
  const lightbox = useLightbox(categoryTiles.map((t) => t.image))
  const [tall] = categoryTiles.slice(4)

  return (
    <section className="category-area">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-12">
            <div className="row">
              {layout.map((cols, i) => (
                <div key={i} className={cols}>
                  <Tile tile={categoryTiles[i]} onOpen={lightbox.openAt(i)} />
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <Tile tile={tall} onOpen={lightbox.openAt(4)} />
          </div>
        </div>
      </div>
      {lightbox.element}
    </section>
  )
}
