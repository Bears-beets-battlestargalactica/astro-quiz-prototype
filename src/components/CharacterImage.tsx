import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
};

export default function CharacterImage({ src, alt, className = "", fallbackLabel }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`image-fallback ${className}`} aria-label={alt}>
        <span>{fallbackLabel ?? alt}</span>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
