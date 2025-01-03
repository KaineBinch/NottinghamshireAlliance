import { useRef } from "react";
import { motion as m, useMotionValue, useAnimationFrame } from "framer-motion";

const ScrollingImages = ({ images, velocity = -10 }) => {
  const baseX = useMotionValue(0);
  const imageCount = images.length;
  const duplicatedImages = [...images, ...images, ...images];
  const mover = useRef(null);

  const getContentWidth = () => {
    if (mover == null) return 100 * imageCount;
    return mover.current.scrollWidth / 3;
  };

  useAnimationFrame((_, delta) => {
    const moveBy = velocity * (delta / 1000);
    baseX.set(baseX.get() + moveBy);
    const contentWidth = getContentWidth();
    if (baseX.get() <= -contentWidth) baseX.set(0);
  });

  return (
    <div className="relative w-full overflow-hidden">
      <m.div
        ref={mover}
        className="whitespace-nowrap will-change-transform"
        style={{ x: baseX }}
      >
        {duplicatedImages.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Logo ${index}`}
            className="inline-block h-[50px] px-5"
            style={{ width: `auto` }}
          />
        ))}
      </m.div>
    </div>
  );
};
export default ScrollingImages;
