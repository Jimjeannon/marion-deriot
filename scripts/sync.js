import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 't4wzgksq',
  dataset: 'production',
  apiVersion: '2024-05-29',
  token: 'sk1vb4nBQ6Lt34ZRDuY2uKWjbla7gBYCsxpjzrxEg5Z2UohTAu0qcJlCKwzNbgGK5u71eaYCg3KaNezmLq6oP2VYFY4dUc6LL2a7f7Qidt7vYEPaWZPoLIz2PIY0OzcXgSGcQaGEqBGvb7rNvFXFPUXF2c6fPeXGSyzm3DM7frIBpPntVltF',
  useCdn: false,
});

const projects = [
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

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function sync() {
  try {
    console.log('Fetching existing projects...');
    const existing = await client.fetch('*[_type == "project"]');
    const map = new Map(existing.map(p => [p.title.fr.toLowerCase(), p]));

    console.log('Checking for deletions...');
    for (const proj of existing) {
      const keep = projects.some(p => p.name.toLowerCase() === proj.title.fr.toLowerCase());
      if (!keep) {
        console.log('DELETE: ' + proj.title.fr);
        await client.delete(proj._id);
      }
    }

    console.log('Syncing projects...');
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      const slug = slugify(p.name);
      const proj = map.get(p.name.toLowerCase());

      if (proj) {
        console.log('UPDATE ' + (i + 1) + ': ' + p.name);
        await client.createOrReplace({
          ...proj,
          location: p.location,
          postalCode: p.postalCode,
          clientType: p.clientType,
          surface: p.surface,
        });
      } else {
        console.log('CREATE ' + (i + 1) + ': ' + p.name);
        await client.create({
          _type: 'project',
          title: { fr: p.name.toUpperCase(), en: p.name },
          slug: { fr: { _type: 'slug', current: slug }, en: { _type: 'slug', current: slug } },
          category: 'residential',
          location: p.location,
          postalCode: p.postalCode,
          clientType: p.clientType,
          surface: p.surface,
          gallery: [],
        });
      }
    }
    console.log('Done!');
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

await sync();
