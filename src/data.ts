export type ProjectStatus = 'Borrador' | 'Completado' | 'En obra' | 'Anteproyecto';

export interface ProjectImage {
  id: string;
  url: string;
  order: number;
}

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  order: number;
  location: string;
  year: string;
  area: string;
  architects: string;
  associatedArchitects?: string;
  collaborators?: string;
  instagramUrl?: string;
  partnerLinks?: string[];
  publications?: string[];
  images: ProjectImage[];
}

export const initialProjects: Project[] = [
  {
    id: 'p1',
    title: 'Casa Serrano',
    status: 'Completado',
    order: 1,
    location: 'Mendoza, Argentina',
    year: '2023',
    area: '450 m2',
    architects: 'Studio ACAA',
    associatedArchitects: 'Estudio XYZ',
    collaborators: 'Ing. Rodrigo Méndez',
    instagramUrl: 'https://instagram.com',
    publications: ['Revista Summa+'],
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
