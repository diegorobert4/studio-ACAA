'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  // Proporción (ancho/alto) real de cada imagen, medida al cargar: en mobile el carrusel toma la proporción de la imagen activa.
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const activeImage = project.images[activeImageIndex];
  const activeRatio = activeImage ? ratios[activeImage.id] : undefined;

  const handleHorizontalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollPosition = target.scrollLeft;
    const slideWidth = target.clientWidth;
    const activeIndex = Math.round(scrollPosition / slideWidth);
    
    setActiveImageIndex(activeIndex);
  };

  const scrollToImage = (imageIndex: number) => {
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({
        left: imageIndex * slideWidth,
        behavior: 'smooth'
      });
    }
  };

  const scrollPrev = () => {
    if (activeImageIndex > 0) {
      scrollToImage(activeImageIndex - 1);
    }
  };

  const scrollNext = () => {
    if (activeImageIndex < project.images.length - 1) {
      scrollToImage(activeImageIndex + 1);
    }
  };

  return (
    <section
      className={styles.section}
      style={activeRatio ? ({ '--active-ratio': activeRatio } as React.CSSProperties) : undefined}
    >
      <div 
        ref={carouselRef}
        className={styles.carousel} 
        onScroll={handleHorizontalScroll}
      >
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

      <div className={styles.overlay}>
        <div className={styles.navArrows}>
          <button 
            className={`${styles.navArrow} ${activeImageIndex === 0 ? styles.navArrowHidden : ''}`} 
            onClick={scrollPrev}
            aria-label="Imagen anterior"
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            className={`${styles.navArrow} ${activeImageIndex === project.images.length - 1 ? styles.navArrowHidden : ''}`} 
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
