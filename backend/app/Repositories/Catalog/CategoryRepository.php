<?php

declare(strict_types=1);

namespace App\Repositories\Catalog;

use App\Models\Builders\ProductBuilder;
use App\Models\Category;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<Category>
 */
final class CategoryRepository extends BaseRepository
{
    protected string $model = Category::class;

    /**
     * Top-level categories, each with its `children`, every node counting its
     * own published products. One query; the tree is assembled in PHP.
     *
     * @return Collection<int, Category>
     */
    public function treeWithPublishedProductCounts(): Collection
    {
        $categories = $this->query()
            ->withCount(['products' => fn (ProductBuilder $query) => $query->published()])
            ->orderBy('position')
            ->orderBy('id')
            ->get();

        $childrenByParent = $categories->whereNotNull('parent_id')->groupBy('parent_id');

        return $categories
            ->whereNull('parent_id')
            ->each(fn (Category $parent) => $parent->setRelation(
                'children',
                $childrenByParent->get($parent->id, new Collection)->values(),
            ))
            ->values();
    }
}
