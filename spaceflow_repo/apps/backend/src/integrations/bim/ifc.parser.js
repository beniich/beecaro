/**
 * Parser de maquettes IFC (Mock parser intelligent pour la démonstration CAFM)
 * Analyse l'IFC et extrait les composants hierarchiques (IfcSite ➔ IfcBuilding ➔ IfcBuildingStorey ➔ IfcProduct)
 */
class IFCParser {
  async parseIFC(fileBuffer, fileName = 'model.ifc') {
    // Dans une integration reelle, nous lirions le fichier ligne par ligne
    // (ex: ISO-10303-21 STEP physical file format)
    // Ici nous simulons l'extraction robuste de l'arborescence IFC.
    
    const storeys = ['Etage 1', 'Etage 2', 'Etage 3'];
    const elements = [];

    // Generer des elements types de maquette
    const types = [
      { type: 'IfcWallStandardCase', prefix: 'Mur Exterieur' },
      { type: 'IfcWindow', prefix: 'Fenetre Double Vitrage' },
      { type: 'IfcDoor', prefix: 'Porte Coupe-Feu' },
      { type: 'IfcFlowTerminal', prefix: 'Diffuseur HVAC CTA' },
      { type: 'IfcSpace', prefix: 'Bureau Open Space' }
    ];

    storeys.forEach((storey, sIdx) => {
      // 8 elements par etage
      for (let i = 0; i < 8; i++) {
        const t = types[i % types.length];
        const id = `IFC-ID-${sIdx}-${i}-${Math.floor(Math.random()*1000)}`;
        elements.push({
          ifcId: id,
          name: `${t.prefix} E${sIdx + 1}.${i + 1}`,
          type: t.type,
          spaceId: `Space-${sIdx}-${i}`,
          properties: [
            { set: 'Pset_ElementCommon', name: 'Reference', value: `${t.type}-${i}` },
            { set: 'Pset_ElementCommon', name: 'LoadBearing', value: t.type.includes('Wall') ? 'TRUE' : 'FALSE' },
            { set: 'Dimension', name: 'Hauteur', value: '2.8m' },
            { set: 'Dimension', name: 'Largeur', value: '1.2m' },
            { set: 'Maintenance', name: 'Derniere inspection', value: new Date().toLocaleDateString() }
          ]
        });
      }
    });

    return {
      name: fileName.replace('.ifc', ''),
      version: 1,
      elements
    };
  }
}

module.exports = new IFCParser();
