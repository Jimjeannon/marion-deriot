import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 't4wzgksq',
  dataset: 'production',
  apiVersion: '2024-05-29',
  token: 'sk1vb4nBQ6Lt34ZRDuY2uKWjbla7gBYCsxpjzrxEg5Z2UohTAu0qcJlCKwzNbgGK5u71eaYCg3KaNezmLq6oP2VYFY4dUc6LL2a7f7Qidt7vYEPaWZPoLIz2PIY0OzcXgSGcQaGEqBGvb7rNvFXFPUXF2c6fPeXGSyzm3DM7frIBpPntVltF',
  useCdn: false,
});

const projectsData = [
  { name: 'Cambacérès', location: 'Paris', postalCode: '75008', clientType: 'maîtrise d\'ouvrage privée', surface: '90m2' },
  { name: 'Vaucresson', location: 'Vaucresson', postalCode: '', clientType: 'maîtrise d\'ouvrage privée', surface: '220m2' },
  { name: 'Bourdonnais', location: 'Paris', postalCode: '75007', clientType: 'maîtrise d\'ouvrage privée', surface: '115m2' },
  { name: 'Lavoisier', location: 'Paris', postalCode: '75007', clientType: 'maîtrise d\'ouvrage privée', surface: 'duplex 125m2' },
  { name: 'Hervieu', location: 'Paris', postalCode: '75015', clientType: 'maîtrise d\'ouvrage privée', surface: '115m2' },
  { name: 'Square de Valois Chesney', location: '', postalCode: '', clientType: 'maîtrise d\'ouvrage privée', surface: '165m2' },
  { name: 'Square du Roule Neuilly', location: 'Neuilly', postalCode: '', clientType: 'rénovation complète d\'un hôtel particulier', surface: '300m2' },
  { name: 'CDG Boulogne Billancourt', location: 'Boulogne-Billancourt', postalCode: '', clientType: 'maîtrise d\'ouvrage privée', surface: '115m2' },
  { name: 'Mignet', location: 'Paris', postalCode: '75016', clientType: 'maîtrise d\'ouvrage privée', surface: 'duplex 220m2' },
  { name: 'Breteuil', location: '', postalCode: '', clientType: 'maîtrise d\'ouvrage privée', surface: '180m2' },
  { name: 'Vertbois', location: '', postalCode: '', clientType: 'maîtrise d\'ouvrage privée', surface: '80m2' },
  { name: 'Malakoff', location: 'Paris', postalCode: '75016', clientType: 'maîtrise d\'ouvrage privée', surface: '150m2' },
  { name: 'Alboni', location: 'Paris', postalCode: '75016', clientType: 'maîtrise d\'ouvrage privée', surface: '140m2' },
  { name: 'Flachat', location: '', postalCode: '', clientType: 'extension d\'une maison', surface: '' },
];

function generateSlug(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function updateProjects() {
  try {
    console.log('Fetching existing projects...');
    const existingProjects = await client.fetch('*[_type == "project"] | order(_createdAt asc)');
    console.log('Found ' + existingProjects.length + ' projects\n');

    const existingMap = new Map(existingProjects.map((p) => [p.title.fr.toLowerCase().trim(), p]));

    const projectsToDelete = existingProjects.filter(
      (p) => !projectsData.some((d) => d.name.toLowerCase().trim() === p.title.fr.toLowerCase().trim())
    );

    if (projectsToDelete.length > 0) {
      console.log('Deleting ' + projectsToDelete.length + ' projects:\n');
      for (const project of projectsToDelete) {
        console.log('  DELETE: ' + project.title.fr);
        await client.delete(project._id);
      }
      console.log('');
    }

    console.log('Syncing ' + projectsData.length + ' projects:\n');
    for (let i = 0; i < projectsData.length; i++) {
      const data = projectsData[i];
      const existing = existingMap.get(data.name.toLowerCase().trim());

      if (existing) {
        const updated = {
          ...existing,
          location: data.location || '',
          postalCode: data.postalCode || '',
          clientType: data.clientType || '',
          surface: data.surface || '',
        };
        await client.createOrReplace(updated);
        console.log('  UPDATE: ' + (i + 1) + '. ' + data.name.toUpperCase());
      } else {
        const slugFr = generateSlug(data.name);
        const newProject = {
          _type: 'project',
          title: {
            fr: data.name.toUpperCase(),
            en: data.name,
          },
          slug: {
            fr: { _type: 'slug', current: slugFr },
            en: { _type: 'slug', current: slugFr },
          },
          category: 'residential',
          location: data.location,
          postalCode: data.postalCode,
          clientType: data.clientType,
          surface: data.surface,
          gallery: [],
        };
        await client.create(newProject);
        console.log('  CREATE: ' + (i + 1) + '. ' + data.name.toUpperCase());
      }
    }

    console.log('\nSync complete!');
  } catch (err) {
    console.error('Error:', err.message);
    throw err;
  }
}

await updateProjects();
