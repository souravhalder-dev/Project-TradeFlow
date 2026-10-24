import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { Layers, ArrowRight } from 'lucide-react';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    include: {
      children: {
        include: {
          _count: { select: { products: true } },
        },
      },
      _count: { select: { products: true } },
    },
    orderBy: { order: 'asc' },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-black tracking-tight text-slate-950 flex items-center">
          <Layers className="w-8 h-8 mr-3 text-brand-orange" />
          <span>Wholesale Industry Categories</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Source directly from specialized production clusters across global industrial verticals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {cat.imageUrl && (
              <div className="relative h-40 w-full bg-slate-100">
                <Image src={cat.imageUrl} alt={cat.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <h2 className="font-extrabold text-lg text-white">{cat.name}</h2>
                  <div className="text-[11px] text-slate-300">{cat._count.products} Total Products</div>
                </div>
              </div>
            )}

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600 line-clamp-2">{cat.description}</p>

              {cat.children?.length > 0 && (
                <div className="space-y-1.5 border-t pt-3 text-xs">
                  <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Subcategories</div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/products?category=${sub.slug}`}
                        className="bg-slate-100 hover:bg-orange-50 hover:text-brand-orange text-slate-700 px-2.5 py-1 rounded text-xs transition-colors"
                      >
                        {sub.name} ({sub._count.products})
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="font-bold text-xs text-brand-orange hover:text-orange-700 flex items-center"
                >
                  <span>Explore All {cat.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
