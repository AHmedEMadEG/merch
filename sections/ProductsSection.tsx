'use client';

import ProductCard from '@/components/cards/ProductCard';
import WishlistLoginModal from '@/components/modals/WishlistLoginModal';
import ProductGridSkeleton from '@/components/skeletons/ProductGridSkeleton';
import { Button } from '@/components/ui/button';
import { getPaginatedProducts, getPaginatedProductsBasedOnLocation } from '@/firebase/productServices';
import { toast } from '@/hooks/use-toast';
import { useToggleFavorites } from '@/hooks/use-toggle-favorites';
import { PAGE_SIZE } from '@/lib/constants';
import { useLocationStore } from '@/stores/locationStore';
import { Product } from '@/types';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function ProductsSection() {
	const { favorites, toggleFavorite, wishlistLoginModalOpen, setWishlistLoginModalOpen } = useToggleFavorites();

	const { location } = useLocationStore();

	const [products, setProducts] = useState<Product[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
	const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [locationLastDoc, setLocationLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
	const [fallbackLastDoc, setFallbackLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
	const [hasMoreLocationProducts, setHasMoreLocationProducts] = useState(true);
	const [hasMoreFallback, setHasMoreFallback] = useState(true);

	useEffect(() => {
		const fetchInitialProducts = async () => {
			setLoading(true);
			try {
				if (location) {
					const res = await getPaginatedProductsBasedOnLocation({
						pageSize: PAGE_SIZE,
						location,
						locationStartAfter: null,
						fallbackStartAfter: null,
						hasMoreLocation: true,
						hasMoreFallback: true,
					});

					setProducts(res.products);
					setLocationLastDoc(res.locationLastVisible);
					setFallbackLastDoc(res.fallbackLastVisible);
					setHasMoreLocationProducts(res.hasMoreLocation);
					setHasMoreFallback(res.hasMoreFallback);
					setHasMore(res.hasMoreFallback || res.hasMoreLocation);
				} else {
					const res = await getPaginatedProducts(PAGE_SIZE);
					setProducts(res.products);
					setLastDoc(res.lastVisible);
					setHasMore(res.hasMore);
				}
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'Failed to load products');
			} finally {
				setLoading(false);
			}
		};
		fetchInitialProducts();
	}, [location]);

	const loadMoreProducts = async () => {
		if (location) {
			setLoadingMoreProducts(true);
			try {
				const res = await getPaginatedProductsBasedOnLocation({
					pageSize: PAGE_SIZE,
					location,
					locationStartAfter: locationLastDoc,
					fallbackStartAfter: fallbackLastDoc,
					hasMoreLocation: hasMoreLocationProducts,
					hasMoreFallback: hasMoreFallback,
				});

				setProducts((prev) => (prev ? [...prev, ...res.products] : res.products));
				setLocationLastDoc(res.locationLastVisible);
				setFallbackLastDoc(res.fallbackLastVisible);
				setHasMoreLocationProducts(res.hasMoreLocation);
				setHasMoreFallback(res.hasMoreFallback);
				setHasMore(res.hasMoreFallback || res.hasMoreLocation);
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'Failed to load more products');
			} finally {
				setLoadingMoreProducts(false);
			}
		} else {
			if (!hasMore) return;
			setLoadingMoreProducts(true);
			try {
				const res = await getPaginatedProducts(PAGE_SIZE, lastDoc);
				setProducts((prev) => (prev ? [...prev, ...res.products] : res.products));
				setLastDoc(res.lastVisible);
				setHasMore(res.hasMore);
			} catch (error) {
				toast.error(error instanceof Error ? error.message : 'Failed to load more products');
			} finally {
				setLoadingMoreProducts(false);
			}
		}
	};

	if (loading) {
		return <ProductGridSkeleton />;
	}

	return (
		<section className="mx-auto max-w-7xl py-8">
			<h2 className="mb-6 text-2xl font-bold">Products</h2>

			{!products || products.length === 0 ? (
				<p className="text-gray-500">No products found.</p>
			) : (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{products?.map((product) => (
						<ProductCard
							key={product.id}
							product={product}
							isFavorite={favorites.includes(product.id)}
							onToggleFavorite={() => toggleFavorite(product.id)}
						/>
					))}
				</div>
			)}

			{/* Load More Button */}
			{hasMore && (
				<div className="mt-12 text-center">
					<Button
						onClick={loadMoreProducts}
						disabled={loadingMoreProducts}
						variant="outline"
						className="rounded-full border-purple-600 px-8 py-3 font-medium text-purple-600 transition-colors duration-200 hover:border-purple-700 hover:bg-purple-50 hover:text-purple-900"
					>
						{loadingMoreProducts ? 'Loading...' : 'Load More Products'}
					</Button>
				</div>
			)}

			{wishlistLoginModalOpen && (
				<WishlistLoginModal isOpen={wishlistLoginModalOpen} onClose={setWishlistLoginModalOpen} />
			)}
		</section>
	);
}
