'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Project } from '@/data';
import { saveProject } from '@/app/actions/projects';
import styles from './ProjectEditor.module.css';
import { Upload } from 'lucide-react';

interface ProjectEditorProps {
  id: string;
  initialProject: Project | null;
  nextOrder: number;
}

export default function ProjectEditor({ id, initialProject, nextOrder }: ProjectEditorProps) {
  const isNew = id === 'new';
  const [project, setProject] = useState<Project | null>(() => {
    if (!isNew && initialProject) return { ...initialProject };
    return {
        id: crypto.randomUUID(),
        title: '',
        status: 'Borrador',
        order: nextOrder,
        location: '',
        year: '',
        area: '',
        architects: 'Studio ACAA',
        images: []
      };
  });

  if (!project) return <div>Cargando...</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProject({ ...project, [name]: value });
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: 'partnerLinks' | 'publications') => {
    const lines = e.target.value.split('\n').filter(line => line.trim() !== '');
    setProject({ ...project, [field]: lines });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === project.images.length - 1) return;

    const newImages = [...project.images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    
    setProject({ ...project, images: newImages });
  };

  const removeImage = (imageId: string) => {
    setProject({ ...project, images: project.images.filter(img => img.id !== imageId) });
  };

  const handleSave = async () => {
    try {
      await saveProject(project);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo guardar el proyecto.');
    }
  };

  return (
    <div>
      <div className={styles.breadcrumb}>
        <Link href="/admin">Proyectos</Link> / {isNew ? 'Nuevo proyecto' : project.title}
      </div>
      
      <div className={styles.header}>
        <h2 className={styles.title}>{isNew ? 'Nuevo proyecto' : 'Editar proyecto'}</h2>
        <div className={styles.actions}>
          <Link href="/admin" className={`${styles.btn} ${styles.btnCancel}`}>Cancelar</Link>
          <button onClick={handleSave} className={`${styles.btn} ${styles.btnSave}`}>Guardar Cambios</button>
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Estado en el sitio</h3>
        <div className={styles.grid2}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Visibilidad</label>
            <select name="status" value={project.status} onChange={handleChange} className={styles.select}>
              <option value="Borrador">Borrador</option>
              <option value="Completado">Completado</option>
              <option value="En obra">En obra</option>
              <option value="Anteproyecto">Anteproyecto</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Información Básica</h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nombre del proyecto</label>
          <input type="text" name="title" value={project.title} onChange={handleChange} className={styles.input} />
        </div>
        
        <div className={styles.grid3}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Ubicación</label>
            <input type="text" name="location" value={project.location} onChange={handleChange} className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Año</label>
            <input type="text" name="year" value={project.year} onChange={handleChange} className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Superficie</label>
            <input type="text" name="area" value={project.area} onChange={handleChange} className={styles.input} />
          </div>
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Equipo y Créditos</h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>Arquitectos</label>
          <input type="text" name="architects" value={project.architects} onChange={handleChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Arquitectos Asociados</label>
          <input type="text" name="associatedArchitects" value={project.associatedArchitects || ''} onChange={handleChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Colaboradores</label>
          <textarea name="collaborators" value={project.collaborators || ''} onChange={handleChange} className={styles.textarea} />
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Vínculos y Publicaciones</h3>
        <div className={styles.formGroup}>
          <label className={styles.label}>Link de Instagram</label>
          <input type="text" name="instagramUrl" value={project.instagramUrl || ''} onChange={handleChange} className={styles.input} placeholder="https://instagram.com/p/..." />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Links de webs de socios colaboradores</label>
          <textarea 
            name="partnerLinks" 
            value={project.partnerLinks ? project.partnerLinks.join('\n') : ''} 
            onChange={(e) => handleArrayChange(e, 'partnerLinks')} 
            className={styles.textarea} 
            placeholder="Un link por línea"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Publicaciones (Revistas, libros, etc.)</label>
          <textarea 
            name="publications" 
            value={project.publications ? project.publications.join('\n') : ''} 
            onChange={(e) => handleArrayChange(e, 'publications')} 
            className={styles.textarea} 
            placeholder="Una publicación por línea"
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Fotografías</h3>
        
        <div className={styles.imageUploadArea}>
          <Upload size={24} color="var(--gray-400)" />
          <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Arrastrá imágenes acá o hacé clic para subir</span>
        </div>

        <div className={styles.imageList}>
          {project.images.map((img, index) => (
            <div key={img.id} className={styles.imageItem}>
              <div className={styles.imageDragHandle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button onClick={() => moveImage(index, 'up')} disabled={index === 0} style={{ padding: 0 }}>▲</button>
                  <button onClick={() => moveImage(index, 'down')} disabled={index === project.images.length - 1} style={{ padding: 0 }}>▼</button>
                </div>
              </div>
              <Image src={img.url} alt="" width={100} height={60} className={styles.imageThumbnail} />
              <div style={{ fontSize: '0.875rem' }}>{img.id}</div>
              <button className={styles.imageRemove} onClick={() => removeImage(img.id)}>Eliminar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
