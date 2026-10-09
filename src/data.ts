export type ProjectStatus = 'Completado' | 'En obra' | 'Anteproyecto';

// Los valores coinciden con el check publicaciones_tipo_check de Supabase.
export type PublicationType =
  | 'revista_digital'
  | 'libro_fisico'
  | 'pagina_web'
  | 'instagram'
  | 'otro';

export const publicationTypeLabels: Record<PublicationType, string> = {
  revista_digital: 'Revista digital',
  libro_fisico: 'Libro físico',
  pagina_web: 'Página web',
  instagram: 'Instagram',
  otro: 'Otro',
};

export interface Publication {
  name: string;
  type: PublicationType;
  url?: string;
}

export interface ProjectImage {
  id: string;
  url: string;
  order: number;
}

// Campos de Project que tienen versión en italiano (tabla proyecto_traduccion_it).
export const translatableFields = ['title', 'architects', 'associatedArchitects', 'collaborators', 'location'] as const;
export type TranslatableField = (typeof translatableFields)[number];
export type ProjectTranslation = Partial<Record<TranslatableField, string>>;

export interface Project {
  id: string;
  translationIt?: ProjectTranslation;
  title: string;
  status: ProjectStatus;
  published: boolean;
  order: number;
  location: string;
  year: string;
  area: string;
  architects: string;
  associatedArchitects?: string;
  collaborators?: string;
  instagramUrl?: string;
  partnerLinks?: string[];
  publications?: Publication[];
  images: ProjectImage[];
  updatedAt?: string;
}

export const initialProjects: Project[] = [
  {
    id: 'p1',
    title: 'Casa Serrano',
    status: 'Completado',
    published: true,
    order: 1,
    location: 'Mendoza, Argentina',
    year: '2023',
    area: '450 m2',
    architects: 'Studio ACAA',
    associatedArchitects: 'Estudio XYZ',
    collaborators: 'Ing. Rodrigo Méndez',
    instagramUrl: 'https://instagram.com',
    publications: [{ name: 'Revista Summa+', type: 'revista_digital' }],
    images: [
      { id: 'img1', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80', order: 1 },
      { id: 'img2', url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', order: 2 },
      { id: 'img3', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', order: 3 },
      { id: 'img3_1', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', order: 4 },
      { id: 'img3_2', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', order: 5 },
      { id: 'img3_3', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', order: 6 },
    ],
  },
  {
    id: 'p2',
    title: 'Pabellón 12',
    status: 'En obra',
    published: true,
    order: 2,
    location: 'Buenos Aires, Argentina',
    year: '2024',
    area: '120 m2',
    architects: 'Studio ACAA',
    images: [
      { id: 'img4', url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80', order: 1 },
      { id: 'img5', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', order: 2 },
      { id: 'img5_1', url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', order: 3 },
      { id: 'img5_2', url: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', order: 4 },
    ],
  },
  {
    id: 'p3',
    title: 'Torre Bahía',
    status: 'Anteproyecto',
    published: true,
    order: 3,
    location: 'Montevideo, Uruguay',
    year: '2025',
    area: '15000 m2',
    architects: 'Studio ACAA',
    collaborators: 'Renderistas SA',
    images: [
      { id: 'img6', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', order: 1 },
      { id: 'img7', url: 'https://images.unsplash.com/photo-1428366890462-dd4baecf492b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80', order: 2 },
    ],
  },
];
