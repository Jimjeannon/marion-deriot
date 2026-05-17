/**
 * Catalogue projets — source locale jusqu'à branchement Sanity.
 * Ordre éditorial (liste cliente).
 */
import type { SiteProject } from '@/lib/projects';

export const PROJECTS_CATALOG: SiteProject[] = [
  {
    id: 'belleville',
    title: { fr: 'BELLEVILLE', en: 'BELLEVILLE' },
    slug: { fr: { current: 'belleville' }, en: { current: 'belleville' } },
    category: 'residential',
    surface: '110 m²',
    location: { fr: 'Paris 18ème', en: 'Paris 18th' },
    description: {
      fr: "Rénovation complète d'un appartement (maîtrise d'ouvrage privée).",
      en: 'Full renovation of a private apartment (private client).',
    },
    imageCount: 16,
    /**
     * Galerie locale — fichiers à déposer dans :
     *   public/images/projets/belleville/01.jpg ... 16.jpg
     *
     * Les 2 images marquées `isPreview: true` (01 et 13) s'affichent côte à côte
     * sur la page projet. Le diaporama immersif présente toutes les 16 images.
     */
    gallery: [
      {
        _type: 'image',
        src: '/images/projets/belleville/01.jpg',
        alt: { fr: 'Cuisine ouverte — îlot en marbre, banquette intégrée en chêne clair, coussins lin vert sauge', en: 'Open-plan kitchen — marble island, built-in oak bench, sage-green linen cushions' },
        orientation: 'portrait',
        isPreview: true,
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/02.jpg',
        alt: { fr: 'Cuisine vue frontale — façades blanches, crédence marbre veiné, suspension linéaire', en: 'Kitchen front view — white cabinetry, veined marble splashback, linear pendant lamp' },
        orientation: 'landscape',
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/03.jpg',
        alt: { fr: 'Couloir donnant sur la cuisine — placards laqués vert céladon, parquet chêne', en: 'Hallway leading to kitchen — celadon-green lacquered cabinetry, oak parquet' },
        orientation: 'portrait',
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/04.jpg',
        alt: { fr: 'Cuisine — banquette en chêne et marbre, perspective sur l\'îlot', en: 'Kitchen — oak and marble bench, view onto the island' },
        orientation: 'portrait',
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/05.jpg',
        alt: { fr: 'Détail — angle de l\'îlot en marbre et menuiserie chêne', en: 'Detail — corner of the marble island and oak joinery' },
        orientation: 'portrait',
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/06.jpg',
        alt: { fr: 'Cuisine — façades hautes blanches, plan de travail marbre, suspension linéaire', en: 'Kitchen — white upper cabinets, marble countertop, linear pendant' },
        orientation: 'portrait',
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/07.jpg',
        alt: { fr: 'Détail — bocal de verre soufflé posé sur tablette marbre', en: 'Detail — blown-glass jar resting on a marble shelf' },
        orientation: 'portrait',
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/08.jpg',
        alt: { fr: 'Détail — poignée laiton sur façade chêne', en: 'Detail — brass handle on oak cabinetry' },
        orientation: 'portrait',
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/09.jpg',
        alt: { fr: 'Détail — rencontre marbre et bois sur le plan de travail', en: 'Detail — marble and wood meeting on the countertop' },
        orientation: 'portrait',
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/10.jpg',
        alt: { fr: 'Cuisine en enfilade — plan marbre, façades chêne, sol pierre grise', en: 'Galley kitchen — marble counter, oak cabinetry, grey stone floor' },
        orientation: 'portrait',
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/11.jpg',
        alt: { fr: 'Salle de bains — miroir rond, vasque encastrée, douche italienne', en: 'Bathroom — round mirror, integrated basin, walk-in shower' },
        orientation: 'portrait',
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/12.jpg',
        alt: { fr: 'Salle d\'eau — vasque marbre, robinetterie laiton brossé', en: 'Powder room — marble basin, brushed brass tap' },
        orientation: 'portrait',
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/13.jpg',
        alt: { fr: 'Salle d\'eau — douche en pierre tramée, robinetterie laiton, banc intégré', en: 'Walk-in shower — striated stone, brass fittings, integrated bench' },
        orientation: 'portrait',
        isPreview: true,
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/14.jpg',
        alt: { fr: 'Salle d\'eau — vasque marbre suspendue, WC, miroir armoire éclairé', en: 'Bathroom — floating marble basin, WC, lit mirror cabinet' },
        orientation: 'portrait',
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/15.jpg',
        alt: { fr: 'Chambre — lampadaire globe laiton, chaise courbe, rideaux lin clair', en: 'Bedroom — brass globe floor lamp, curved chair, sheer linen curtains' },
        orientation: 'portrait',
      },
      {
        _type: 'image',
        src: '/images/projets/belleville/16.jpg',
        alt: { fr: 'Chambre — tête de lit chêne rétro-éclairée, applique laiton', en: 'Bedroom — backlit oak headboard, brass wall sconce' },
        orientation: 'portrait',
      },
    ],
  },
  {
    id: 'square-de-valois',
    title: { fr: 'SQUARE DE VALOIS', en: 'SQUARE DE VALOIS' },
    slug: { fr: { current: 'square-de-valois' }, en: { current: 'square-de-valois' } },
    category: 'residential',
    surface: '165 m²',
    description: {
      fr: "Rénovation complète d'un appartement (maîtrise d'ouvrage privée).",
      en: 'Full renovation of a private apartment (private client).',
    },
    imageCount: 20,
    gallery: [],
  },
  {
    id: 'hervieu',
    title: { fr: 'HERVIEU', en: 'HERVIEU' },
    slug: { fr: { current: 'hervieu' }, en: { current: 'hervieu' } },
    category: 'residential',
    surface: '135 m²',
    location: { fr: 'Paris 15ème', en: 'Paris 15th' },
    description: {
      fr: "Rénovation globale d'un appartement (maîtrise d'ouvrage privée).",
      en: 'Comprehensive renovation of a private apartment (private client).',
    },
    imageCount: 23,
    gallery: [],
  },
  {
    id: 'vertbois',
    title: { fr: 'VERTBOIS', en: 'VERTBOIS' },
    slug: { fr: { current: 'vertbois' }, en: { current: 'vertbois' } },
    category: 'residential',
    surface: '80 m²',
    year: 2013,
    description: {
      fr: 'Rénovation complète — cuisine semi-ouverte, verrière, bibliothèque en ferronnerie, marbrerie sur mesure (2012-2013).',
      en: 'Full renovation — semi-open kitchen, glass partition, bespoke ironwork library, custom marble work (2012-2013).',
    },
    imageCount: 14,
    gallery: [],
  },
  {
    id: 'vaucresson',
    title: { fr: 'VAUCRESSON', en: 'VAUCRESSON' },
    slug: { fr: { current: 'vaucresson' }, en: { current: 'vaucresson' } },
    category: 'residential',
    surface: '220 m²',
    description: {
      fr: "Rénovation complète d'une maison.",
      en: 'Full renovation of a house.',
    },
    imageCount: 20,
    gallery: [],
  },
  {
    id: 'lavoisier',
    title: { fr: 'LAVOISIER', en: 'LAVOISIER' },
    slug: { fr: { current: 'lavoisier' }, en: { current: 'lavoisier' } },
    category: 'residential',
    surface: '126 m²',
    location: { fr: 'Paris 8ème', en: 'Paris 8th' },
    description: {
      fr: "Rénovation d'un duplex (maîtrise d'ouvrage privée).",
      en: 'Renovation of a duplex apartment (private client).',
    },
    imageCount: 18,
    gallery: [],
  },
  {
    id: 'mignet',
    title: { fr: 'MIGNET', en: 'MIGNET' },
    slug: { fr: { current: 'mignet' }, en: { current: 'mignet' } },
    category: 'residential',
    surface: '220 m²',
    location: { fr: 'Paris 16ème', en: 'Paris 16th' },
    description: {
      fr: "Rénovation complète d'un duplex (maîtrise d'ouvrage privée).",
      en: 'Full renovation of a duplex apartment (private client).',
    },
    imageCount: 15,
    gallery: [],
  },
  {
    id: 'breteuil',
    title: { fr: 'BRETEUIL', en: 'BRETEUIL' },
    slug: { fr: { current: 'breteuil' }, en: { current: 'breteuil' } },
    category: 'residential',
    surface: '180 m²',
    year: 2016,
    description: {
      fr: 'Rénovation complète — ferronnerie sur mesure, dressing en pierre composite, cuisine en mélèze brossé, granit brésilien (2015-2016).',
      en: 'Full renovation — bespoke ironwork, composite stone dressing room, brushed larch kitchen, Brazilian granite (2015-2016).',
    },
    imageCount: 15,
    gallery: [],
  },
  {
    id: 'square-du-roule',
    title: { fr: 'SQUARE DU ROULE', en: 'SQUARE DU ROULE' },
    slug: { fr: { current: 'square-du-roule' }, en: { current: 'square-du-roule' } },
    category: 'residential',
    surface: '300 m² (4 niveaux + terrasse 80 m²)',
    location: { fr: 'Neuilly-sur-Seine', en: 'Neuilly-sur-Seine' },
    year: 2016,
    description: {
      fr: "Rénovation d'un hôtel particulier Art Déco, maîtrise d'ouvrage privée (2015-2016).",
      en: 'Renovation of an Art Deco private mansion (private client, 2015-2016).',
    },
    imageCount: 15,
    gallery: [],
  },
  {
    id: 'cambaceres',
    title: { fr: 'CAMBACERES', en: 'CAMBACERES' },
    slug: { fr: { current: 'cambaceres' }, en: { current: 'cambaceres' } },
    category: 'residential',
    surface: '95 m²',
    location: { fr: 'Paris 8ème', en: 'Paris 8th' },
    description: {
      fr: "Rénovation complète d'un appartement (maîtrise d'ouvrage privée).",
      en: 'Full renovation of a private apartment (private client).',
    },
    imageCount: 18,
    gallery: [],
  },
  {
    id: 'malakoff',
    title: { fr: 'MALAKOFF', en: 'MALAKOFF' },
    slug: { fr: { current: 'malakoff' }, en: { current: 'malakoff' } },
    category: 'residential',
    surface: '150 m²',
    location: { fr: 'Paris 16ème', en: 'Paris 16th' },
    description: {
      fr: "Rénovation complète d'un appartement (maîtrise d'ouvrage privée).",
      en: 'Full renovation of a private apartment (private client).',
    },
    gallery: [],
  },
];
