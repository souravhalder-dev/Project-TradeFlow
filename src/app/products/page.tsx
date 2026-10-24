import React from 'react';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ProductStatus, Prisma } from '@prisma/client';
import Link from 'next/link';
import { Filter, Search, RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    country?: string;
    minPrice?: string;
    maxPrice?: string;
    maxMoq?: string;
    verified?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ProductsCatalogPage({ searchParams }: SearchProps) {
  const params = await searchParams;
  const q = params.q?.trim() || '';
  const categorySlug = params.category;
  const country = params.country;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const maxMoq = params.maxMoq ? parseInt(params.maxMoq, 10) : undefined;
  const verifiedOnly = params.verified === 'true';
  const sort = params.sort || 'newest';
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.PUBLISHED,
  };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { shortDescription: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { business: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (country) {
    where.countryOfOrigin = { equals: country, mode: 'insensitive' };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.basePrice = {};
    if (minPrice !== undefined && !isNaN(minPrice)) where.basePrice.gte = minPrice;
    if (maxPrice !== undefined && !isNaN(maxPrice)) where.basePrice.lte = maxPrice;
  }

  if (maxMoq !== undefined && !isNaN(maxMoq)) {
    where.moq = { lte: maxMoq };
  }

  if (verifiedOnly) {
    where.business = { isVerified: true };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { basePrice: 'asc' };
  else if (sort === 'price_desc') orderBy = { basePrice: 'desc' };
  else if (sort === 'moq_asc') orderBy = { moq: 'asc' };

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        business: true,
        images: { orderBy: { order: 'asc' } },
        priceTiers: { orderBy: { minQuantity: 'asc' } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* Search Header Banner */}
      <div className="mb-8 border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Wholesale Product Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing <strong className="text-slate-800">{totalCount}</strong> verified wholesale listing(s)
            {q && <span> for keyword &ldquo;<strong className="text-slate-900">{q}</strong>&rdquo;</span>}
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-500 font-medium">Sort by:</span>
          <form method="GET" className="flex items-center">
            {q && <input type="hidden" name="q" value={q} />}
            {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
            {country && <input type="hidden" name="country" value={country} />}
            {minPrice && <input type="hidden" name="minPrice" value={minPrice} />}
            {maxPrice && <input type="hidden" name="maxPrice" value={maxPrice} />}
            {maxMoq && <input type="hidden" name="maxMoq" value={maxMoq} />}
            {verifiedOnly && <input type="hidden" name="verified" value="true" />}
            <select
              name="sort"
              defaultValue={sort}
              className="border rounded-md px-3 py-1.5 text-xs bg-white text-slate-800 font-medium cursor-pointer outline-none focus:ring-1 focus:ring-brand-orange"
            >
              <option value="newest">Recently Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="moq_asc">MOQ: Low to High</option>
            </select>
            <button type="submit" className="ml-2 px-2.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold">
              Apply
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Faceted Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border bg-white p-5 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-bold text-sm text-slate-900 flex items-center">
                <Filter className="w-4 h-4 mr-2 text-brand-orange" /> Sourcing Filters
              </span>
              <Link href="/products" className="text-[11px] text-slate-400 hover:text-brand-orange flex items-center">
                <RotateCcw className="w-3 h-3 mr-1" /> Reset
              </Link>
            </div>

            <form method="GET" className="space-y-5 text-xs">
              {q && <input type="hidden" name="q" value={q} />}

              {/* Categories Filter */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">Category</label>
                <select
                  name="category"
                  defaultValue={categorySlug || ''}
                  className="w-full border rounded-lg p-2 bg-slate-50 text-slate-800 outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verified Suppliers Toggle */}
              <div className="pt-2 border-t">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="verified"
                    value="true"
                    defaultChecked={verifiedOnly}
                    className="rounded border-slate-300 text-brand-orange focus:ring-brand-orange"
                  />
                  <span className="font-semibold text-slate-800 flex items-center">
                    <ShieldCheck className="w-4 h-4 text-amber-500 mr-1" /> Verified Suppliers Only
                  </span>
                </label>
              </div>

              {/* MOQ Filter */}
              <div className="pt-2 border-t">
                <label className="block font-bold text-slate-800 mb-1">Max Minimum Order (MOQ)</label>
                <input
                  type="number"
                  name="maxMoq"
                  placeholder="e.g. 100"
                  defaultValue={maxMoq || ''}
                  className="w-full border rounded-lg p-2 text-xs outline-none"
                />
              </div>

              {/* Price Range Filter */}
              <div className="pt-2 border-t">
                <label className="block font-bold text-slate-800 mb-1">Price Range (USD)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min ($)"
                    defaultValue={minPrice || ''}
                    className="border rounded-lg p-2 text-xs outline-none"
                  />
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max ($)"
                    defaultValue={maxPrice || ''}
                    className="border rounded-lg p-2 text-xs outline-none"
                  />
                </div>
              </div>

              {/* Country of Origin Filter */}
              <div className="pt-2 border-t">
                <label className="block font-bold text-slate-800 mb-1">Country of Origin</label>
                <input
                  type="text"
                  name="country"
                  placeholder="e.g. China, Germany, Norway"
                  defaultValue={country || ''}
                  className="w-full border rounded-lg p-2 text-xs outline-none"
                />
              </div>

              <Button type="submit" variant="brand" className="w-full py-2.5 rounded-lg text-xs font-bold shadow">
                Apply Filters
              </Button>
            </form>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-8">
          {products.length === 0 ? (
            <div className="rounded-2xl border bg-white p-12 text-center space-y-4 shadow-sm">
              <div className="mx-auto w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-brand-orange">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching wholesale products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try widening your price range, lowering MOQ requirements, or resetting active filters.
              </p>
              <Link href="/products">
                <Button variant="outline" size="sm" className="mt-2">
                  Clear All Filters
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p as any} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6 border-t">
              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1;
                const isCurrent = pageNumber === page;
                return (
                  <Link
                    key={pageNumber}
                    href={`/products?page=${pageNumber}${q ? `&q=${q}` : ''}${categorySlug ? `&category=${categorySlug}` : ''}${sort ? `&sort=${sort}` : ''}`}
                    className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                      isCurrent
                        ? 'bg-brand-orange text-white shadow'
                        : 'bg-white border text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNumber}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
