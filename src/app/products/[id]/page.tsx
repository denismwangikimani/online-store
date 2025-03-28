/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ProductCard from "@/app/components/shop/ProductCard";
import { useCart } from "@/app/contexts/CartContext";
import { useAuth } from "@/app/contexts/AuthProvider";
import ShippingFormModal from "@/app/components/shop/ShippingFormModal";
import {
  ShippingDetails,
  ShippingAddress,
  BillingAddress,
} from "@/types/checkout";
import toast from "react-hot-toast";

interface ShippingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shippingDetails: ShippingDetails) => void;
  initialDetails: ShippingDetails;
  isProcessing: boolean;
}

// interface CartItem {
//   id: number;
//   quantity: number;
//   color: string;
//   size: string;
// }

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [useSameAddress, setUseSameAddress] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

  // Shipping details state
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    name: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US",
    },
    saveDetails: true,
  });

  useEffect(() => {
    async function fetchProduct() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        setProduct(data);

        // Once we have the product, fetch recommendations from other categories
        if (data && data.category) {
          fetchRecommendedProducts(data.category, data.id);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchRecommendedProducts(
      currentCategory: string,
      currentProductId: number
    ) {
      try {
        // Fetch products from categories other than the current one
        const response = await fetch(
          `/api/shop/recommended-products?excludeCategory=${encodeURIComponent(
            currentCategory
          )}&excludeProduct=${currentProductId}`
        );
        if (!response.ok)
          throw new Error("Failed to fetch recommended products");
        const data = await response.json();
        setRecommendedProducts(data);
      } catch (error) {
        console.error("Error fetching recommended products:", error);
      }
    }

    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    // Load customer profile if available
    const loadCustomerProfile = async () => {
      if (!user) return;

      setIsLoadingProfile(true);
      try {
        const response = await fetch("/api/customer/profile");
        if (response.ok) {
          const data = await response.json();
          setCustomerProfile(data);

          if (data) {
            // Pre-fill shipping details if available
            setShippingDetails((prevState) => ({
              ...prevState,
              name: data.first_name
                ? `${data.first_name} ${data.last_name || ""}`
                : "",
              phone: data.phone || "",
              address: data.address || prevState.address,
            }));
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadCustomerProfile();
  }, [user]);

  const handleShippingInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setShippingDetails((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else if (name.startsWith("billing.")) {
      const billingField = name.split(".")[1];
      setShippingDetails((prev) => ({
        ...prev,
        billingAddress: {
          ...(prev.billingAddress || prev.address), // Initialize with shipping address if empty
          [billingField]: value,
        },
      }));
    } else {
      setShippingDetails((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const validateShippingDetails = () => {
    const { name, phone, address } = shippingDetails;

    if (
      !name ||
      !phone ||
      !address.line1 ||
      !address.city ||
      !address.state ||
      !address.postal_code ||
      !address.country
    ) {
      toast.error("Please complete all required shipping fields");
      return false;
    }

    if (!useSameAddress && shippingDetails.billingAddress) {
      const billing = shippingDetails.billingAddress;
      if (
        !billing.line1 ||
        !billing.city ||
        !billing.state ||
        !billing.postal_code ||
        !billing.country
      ) {
        toast.error("Please complete all required billing fields");
        return false;
      }
    }

    return true;
  };

  const handleDirectCheckout = async () => {
    if (!product) return;

    if (!user) {
      toast.error("Please sign in to checkout");
      return;
    }

    if (product.colors?.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }

    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    // Instead of showing inline form, open modal
    setIsShippingModalOpen(true);
  };

  const handleShippingFormSubmit = async (details: ShippingDetails) => {
    try {
      if (!product) {
        toast.error("Product information not available");
        return;
      }

      setProcessingCheckout(true);

      // Create a checkout item from the current product
      const checkoutItem = {
        id: product.id,
        name: product.name,
        price: product.discount_percentage
          ? product.discounted_price ??
            product.price * (1 - product.discount_percentage / 100)
          : product.price,
        image_url: product.image_url ?? "",
        quantity: 1,
        color: selectedColor,
        size: selectedSize,
      };

      // If billing address is the same as shipping, don't send it
      const checkoutData = {
        items: [checkoutItem],
        checkoutType: "direct",
        shippingDetails: details,
      };

      const response = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Checkout failed");
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Checkout failed. Please try again.");
      setProcessingCheckout(false);
    }
  };

  // Set default color and size selections
  useEffect(() => {
    if (product) {
      if (product.colors?.length) {
        setSelectedColor(product.colors[0]);
      }
      if (product.sizes?.length) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]);

  if (isLoading || isLoadingProfile) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 bg-gray-100 aspect-square animate-pulse rounded-lg"></div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-8 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-6 bg-gray-100 animate-pulse rounded w-1/4"></div>
            <div className="h-32 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-12 bg-gray-100 animate-pulse rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link
          href="/"
          className="text-black hover:text-gray-600 mt-4 inline-block"
        >
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className=" mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-black hover:text-gray-600"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-16">
        {/* Product Image */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover object-center"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold text-black">{product.name}</h1>

          {/* Price */}
          <div className="mt-4">
            {product.discount_percentage ? (
              <div className="flex items-center">
                <p className="text-2xl font-bold text-red-600 mr-3">
                  $
                  {product.discounted_price?.toFixed(2) ||
                    (
                      product.price *
                      (1 - (product.discount_percentage || 0) / 100)
                    ).toFixed(2)}
                </p>
                <p className="text-lg text-gray-500 line-through">
                  ${product.price.toFixed(2)}
                </p>
                <span className="ml-3 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {product.discount_percentage}% OFF
                </span>
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-800">
                ${product.price.toFixed(2)}
              </p>
            )}
          </div>

          {/* Category */}
          <p className="text-sm text-gray-600 mt-2">
            Category: {product.category}
          </p>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-black">Description</h2>
            <div className="mt-2 prose prose-sm text-gray-600">
              {product.description}
            </div>
          </div>

          {/* Color Options */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-900">Color</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`relative w-9 h-9 rounded-full border ${
                      selectedColor === color
                        ? "ring-2 ring-black ring-offset-2"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  >
                    <span className="sr-only">{color}</span>
                  </button>
                ))}
              </div>
              {selectedColor && (
                <p className="mt-1 text-sm text-gray-500">
                  Selected: {selectedColor}
                </p>
              )}
            </div>
          )}

          {/* Size Options */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-900">Size</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`py-2 px-4 text-sm font-medium rounded-md ${
                      selectedSize === size
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Form - show when proceeding to checkout */}
          <ShippingFormModal
            isOpen={isShippingModalOpen}
            onClose={() => setIsShippingModalOpen(false)}
            onSubmit={handleShippingFormSubmit}
            initialDetails={shippingDetails}
            isProcessing={processingCheckout}
          />

          <div className="mt-6 space-y-4">
            {/* Add to Cart button */}
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  toast.error("Please sign in to add to cart");
                  return;
                }

                if (product.colors?.length > 0 && !selectedColor) {
                  toast.error("Please select a color");
                  return;
                }

                if (product.sizes?.length > 0 && !selectedSize) {
                  toast.error("Please select a size");
                  return;
                }

                addToCart(product.id, 1, selectedColor, selectedSize);

                // toast.success("Added to cart");
              }}
              className="w-full bg-gray-800 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Add to Cart
            </button>

            {/* Buy Now button */}
            <button
              type="button"
              onClick={handleDirectCheckout}
              disabled={processingCheckout}
              className="w-full bg-black border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {processingCheckout ? "Processing..." : "Buy Now"}
            </button>

            {/* Product details */}
            {product.stock > 0 ? (
              <p className="text-green-600 text-sm">
                In stock ({product.stock} available)
              </p>
            ) : (
              <p className="text-red-600 text-sm">Out of stock</p>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
            {recommendedProducts.map((recommendedProduct) => (
              <ProductCard
                key={recommendedProduct.id}
                product={recommendedProduct}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
