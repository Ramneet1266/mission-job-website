import Image, { ImageProps as NextImageProps } from "next/image";
import { ImgHTMLAttributes, useState } from "react";
import ContentLoader from "./content-loader";
import clsx from "clsx";

export type ImgProps = ImgHTMLAttributes<HTMLImageElement>;

export type WrapImageWithLoaderProps =
  | (NextImageProps & { renderAs: "next"; fallbackSrc?: string })
  | (ImgProps & { renderAs: "img"; fallbackSrc?: string });

export function WrapImageWithLoader({
  renderAs = "next",
  ...props
}: WrapImageWithLoaderProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Helper function to determine the className for the image
  const getClassName = () =>
    clsx(
      props?.className ?? "",
      isLoading ? "opacity-0" : "opacity-100",
      "transition-opacity duration-500 ease-in-out"
    );

  return (
    <div className="relative w-full h-full bg-white">
      {/* Show loader while loading */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
          <ContentLoader />
        </div>
      )}
      
      {/* Show error message if loading fails */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center border rounded-lg">
          <p className="text-sm text-red-500">Failed to load image</p>
        </div>
      )}

      {!hasError && renderAs === "next" && (
        <Image
          {...(props as NextImageProps)}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          // unoptimized={props.src?.startsWith("http")} // Allow external images
          className={getClassName()}
        />
      )}

      {!hasError && renderAs === "img" && (
        <img
          {...(props as ImgProps)}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={getClassName()}
        />
      )}
    </div>
  );
}
