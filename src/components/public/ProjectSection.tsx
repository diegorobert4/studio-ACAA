'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { Project } from '@/data';
import styles from './ProjectSection.module.css';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { localizeProject, useLanguage } from '@/lib/i18n';

// Luminancia relativa (WCAG) bajo la cual el texto blanco contrasta más que el negro.
const DARK_TEXT_THRESHOLD = 0.179;

const toLinear = (channel: number) => {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/**
 * Luminancia media de la zona de la imagen que queda detrás del título.
 * Traduce el rectángulo del título (relativo a la sección) a coordenadas de la imagen original,
 * respetando el object-fit (cover en desktop, contain en mobile). Lo que cae fuera de la imagen cuenta como negro.
 */
function luminanceBehind(img: HTMLImageElement, section: DOMRect, title: DOMRect): number | null {
  const { naturalWidth: nw, naturalHeight: nh, clientWidth: w, clientHeight: h } = img;
  if (!nw || !nh || !w || !h) return null;
  const scale = getComputedStyle(img).objectFit === 'contain' ? Math.min(w / nw, h / nh) : Math.max(w / nw, h / nh);
  const offsetX = (w - nw * scale) / 2;
  const offsetY = (h - nh * scale) / 2;
  const x0 = (title.left - section.left - offsetX) / scale;
  const y0 = (title.top - section.top - offsetY) / scale;
  const x1 = x0 + title.width / scale;
  const y1 = y0 + title.height / scale;
  const sx = Math.max(0, x0), sy = Math.max(0, y0);
  const sw = Math.min(nw, x1) - sx, sh = Math.min(nh, y1) - sy;
  if (sw < 1 || sh < 1) return 0;
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 12;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    total += 0.2126 * toLinear(data[i]) + 0.7152 * toLinear(data[i + 1]) + 0.0722 * toLinear(data[i + 2]);
  }
  const pixels = data.length / 4;
  // La parte del título que cae fuera de la imagen (barras negras) aporta luminancia 0.
  const coveredShare = Math.min(1, (sw * sh) / (title.width / scale * (title.height / scale)));
  return (total / pixels) * coveredShare;
}

interface ProjectSectionProps {
  project: Project;
  index: number;
  isLast: boolean;
  onOpenInfo: (project: Project) => void;
  onScrollToNext: (e: React.MouseEvent, index: number) => void;
  onScrollToPrevious: (e: React.MouseEvent, index: number) => void;
}

export default function ProjectSection({ project, index, isLast, onOpenInfo, onScrollToNext, onScrollToPrevious }: ProjectSectionProps) {
  const { language, t } = useLanguage();
  const imageCount = project.images.length;
  const isLooping = imageCount > 1;
  // Embla se encarga del loop infinito (swipe, momentum y flechas); selectedScrollSnap() ya es el índice de la imagen real.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, watchDrag: isLooping });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // Proporción (ancho/alto) real de cada imagen, medida al cargar: en mobile el carrusel toma la proporción de la imagen activa.
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const activeImage = project.images[activeImageIndex];
  const activeRatio = activeImage ? ratios[activeImage.id] : undefined;
  // Color del título: blanco u oscuro, según el brillo real de la imagen detrás de él.
  const [darkTitle, setDarkTitle] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const title = localizeProject(project, language).title;

  const measureTitleBackground = useCallback(() => {
    const img = imageRefs.current[activeImageIndex];
    if (!img || !img.complete || !sectionRef.current || !titleRef.current) return;
    try {
      const luminance = luminanceBehind(img, sectionRef.current.getBoundingClientRect(), titleRef.current.getBoundingClientRect());
      if (luminance !== null) setDarkTitle(luminance > DARK_TEXT_THRESHOLD);
    } catch {
      // Canvas bloqueado (imagen de otro origen sin CORS): se queda en blanco.
      setDarkTitle(false);
    }
  }, [activeImageIndex]);

  // Re-medir al cambiar de imagen, de idioma/título o de proporción (mobile), y al redimensionar.
  useEffect(() => {
    measureTitleBackground();
    window.addEventListener('resize', measureTitleBackground);
    return () => window.removeEventListener('resize', measureTitleBackground);
  }, [measureTitleBackground, title, activeRatio]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActiveImageIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollToImage = useCallback((imageIndex: number) => emblaApi?.scrollTo(imageIndex), [emblaApi]);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      style={activeRatio ? ({ '--active-ratio': activeRatio } as React.CSSProperties) : undefined}
    >
      <div ref={emblaRef} className={styles.carousel}>
        <div className={styles.carouselTrack}>
          {project.images.map((img, i) => (
            <div key={img.id} className={styles.slide}>
              <Image
                src={img.url}
                alt={`${project.title} - ${img.id}`}
                fill
                sizes="100vw"
                quality={90}
                className={styles.image}
                priority={index === 0 && i === 0}
                ref={(el) => { imageRefs.current[i] = el; }}
                onLoad={(e) => {
                  const { naturalWidth, naturalHeight } = e.currentTarget;
                  if (naturalWidth && naturalHeight) setRatios((current) => ({ ...current, [img.id]: naturalWidth / naturalHeight }));
                  if (i === activeImageIndex) measureTitleBackground();
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={`${styles.overlay} ${darkTitle ? styles.overlayDarkTitle : ''}`}>
        <div className={styles.navArrows}>
          <button 
            className={`${styles.navArrow} ${!isLooping ? styles.navArrowHidden : ''}`}
            onClick={scrollPrev}
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            className={`${styles.navArrow} ${!isLooping ? styles.navArrowHidden : ''}`}
            onClick={scrollNext}
            aria-label="Siguiente imagen"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <button
          className={styles.infoBtn}
          onClick={() => onOpenInfo(project)}
          aria-label={t.viewInfo}
        >
          <Plus size={22} />
        </button>
        <div className={styles.bottomArea}>
          <div className={styles.projectHeader}>
            <h2 ref={titleRef} className={`${styles.projectTitle} ${darkTitle ? styles.projectTitleDark : ''}`}>{title}</h2>
          </div>
          
          <div className={styles.dotsContainer}>
            <div className={styles.dots}>
              {project.images.map((_, i) => (
                <button 
                  key={i} 
                  className={`${styles.dot} ${activeImageIndex === i ? styles.dotActive : ''}`} 
                  onClick={() => scrollToImage(i)}
                  aria-label={`Ver imagen ${i + 1}`}
                />
              ))}
            </div>
          </div>

        </div>

        <div className={styles.verticalNav}>
          <button
            className={`${styles.verticalArrow} ${styles.arrowUp} ${index === 0 ? styles.verticalArrowHidden : ''}`}
            onClick={(e) => onScrollToPrevious(e, index)}
            aria-label="Previous project"
            tabIndex={index === 0 ? -1 : undefined}
          >
            <ArrowUp size={18} />
          </button>
          <button
            className={`${styles.verticalArrow} ${styles.arrowDown} ${isLast ? styles.verticalArrowHidden : ''}`}
            onClick={(e) => onScrollToNext(e, index)}
            tabIndex={isLast ? -1 : undefined}
            aria-label="Next project"
          >
            <ArrowDown size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
