'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import { Project } from '@/data';
import styles from './ProjectSection.module.css';
import { ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { localizeProject, useLanguage } from '@/lib/i18n';

interface ProjectSectionProps {
  project: Project;
  index: number;
  onOpenInfo: (project: Project) => void;
  onScrollToNext: (e: React.MouseEvent, index: number) => void;
}

export default function ProjectSection({ project, index, onOpenInfo, onScrollToNext }: ProjectSectionProps) {
  const { language, statusLabel } = useLanguage();
  const imageCount = project.images.length;
  const isLooping = imageCount > 1;
  // Embla se encarga del loop infinito (swipe, momentum y flechas); selectedScrollSnap() ya es el índice de la imagen real.
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, watchDrag: isLooping });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // Proporción (ancho/alto) real de cada imagen, medida al cargar: en mobile el carrusel toma la proporción de la imagen activa.
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const activeImage = project.images[activeImageIndex];
  const activeRatio = activeImage ? ratios[activeImage.id] : undefined;

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
                onLoad={(e) => {
                  const { naturalWidth, naturalHeight } = e.currentTarget;
                  if (naturalWidth && naturalHeight) setRatios((current) => ({ ...current, [img.id]: naturalWidth / naturalHeight }));
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.overlay}>
        <div className={styles.navArrows}>
          <button 
            className={`${styles.navArrow} ${!isLooping ? styles.navArrowHidden : ''}`}
            onClick={scrollPrev}
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            className={`${styles.navArrow} ${!isLooping ? styles.navArrowHidden : ''}`}
            onClick={scrollNext}
            aria-label="Siguiente imagen"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        <div className={styles.topRight}>
          <button 
            className={styles.infoBtn}
            onClick={() => onOpenInfo(project)}
          >
            Ver información
          </button>
        </div>
        <div className={styles.bottomArea}>
          <div className={styles.projectHeader}>
            <div className={styles.projectIndex}>
              0{index + 1} — {statusLabel(project.status)}
            </div>
            <h2 className={styles.projectTitle}>{localizeProject(project, language).title}</h2>
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

          <div className={styles.arrowContainer}>
            <button 
              className={styles.downArrow} 
              onClick={(e) => onScrollToNext(e, index)}
              aria-label="Next project"
            >
              <ArrowDown size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
