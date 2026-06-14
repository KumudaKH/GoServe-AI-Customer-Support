import { useState } from "react";
import {
  getProductImage,
  handleProductImageError,
} from "../utils/productImage";

export default function ProductImage({
  src,
  alt,
  category,
  className = "",
}) {
  const [imgSrc, setImgSrc] = useState(() => getProductImage(src, category, alt));

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={className}
      onError={(e) => {
        handleProductImageError(e, category, alt);
        setImgSrc(getProductImage(null, category, alt));
      }}
    />
  );
}
