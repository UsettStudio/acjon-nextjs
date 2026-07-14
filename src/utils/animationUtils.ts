// Preload all slider images and ensure they are fully loaded before use
export const preloadImages = (selector: string = '.slide__img'): Promise<void[]> => {
  const images = Array.from(document.querySelectorAll(selector)) as HTMLImageElement[];
  
  return Promise.all(
    images.map(img => {
      if (img.complete) {
        return Promise.resolve();
      }
      
      return new Promise<void>((resolve, reject) => {
        img.addEventListener('load', () => resolve());
        img.addEventListener('error', () => reject(new Error(`Failed to load image: ${img.src}`)));
        
        // Force load if src is set but not loading
        if (img.src && !img.complete) {
          img.src = img.src;
        }
      });
    })
  );
};
