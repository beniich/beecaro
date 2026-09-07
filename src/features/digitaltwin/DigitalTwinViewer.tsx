import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, 
  Upload, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  Ruler, 
  Sliders, 
  Maximize2, 
  Activity, 
  Wind, 
  Droplets, 
  Zap, 
  Cpu, 
  Eye, 
  Building2, 
  Scissors, 
  FileText,
  HelpCircle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { BimDiscipline, BimElement, BimLayerVisibility, BimRenderMode } from '../../types/bim';
import { BimModelLoader, LoadedBimScene } from './BimModelLoader';
import { BimThreeCanvas } from './BimThreeCanvas';
import { BimPropertiesSidebar } from './BimPropertiesSidebar';
import { BimTreeHierarchy } from './BimTreeHierarchy';

interface DigitalTwinViewerProps {
  onOpenTicket: (assetId?: string) => void;
  onInspectAsset: (assetId: string) => void;
  isLightMode?: boolean;
}

export const DigitalTwinViewer: React.FC<DigitalTwinViewerProps> = ({
  onOpenTicket,
  onInspectAsset,
  isLightMode = false
}) => {
  const [activeModelKey, setActiveModelKey] = useState<'beetower' | 'plant' | 'office' | 'custom'>('beetower');
  const [bimScene, setBimScene] = useState<LoadedBimScene | null>(null);
  const [selectedElement, setSelectedElement] = useState<BimElement | null>(null);
  const [renderMode, setRenderMode] = useState<BimRenderMode>('pbr');
  const [selectedStoreyFilter, setSelectedStoreyFilter] = useState<number | string | 'all'>('all');
  const [clippingYPercent, setClippingYPercent] = useState<number>(100);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [showTree, setShowTree] = useState<boolean>(true);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);

  // Granular Building Layers Visibility State
  const [layerVisibility, setLayerVisibility] = useState<BimLayerVisibility>({
    walls: true,
    foundations: true,
    hvac: true,
    plumbing: true,
    electrical: true,
    equipment: true,
    spaces: true
  });

  // Toggle single layer
  const toggleLayer = (layer: keyof BimLayerVisibility) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  // Set multiple layers at once (e.g. presets)
  const setAllLayers = (layers: Partial<BimLayerVisibility>) => {
    setLayerVisibility(prev => ({
      ...prev,
      ...layers
    }));
  };

  // Backwards compatibility disciplines state
  const [visibleDisciplines, setVisibleDisciplines] = useState<Record<BimDiscipline, boolean>>({
    structure: true,
    hvac: true,
    plumbing: true,
    electrical: true,
    equipment: true,
    space: true,
    sensor: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Model on selection
  useEffect(() => {
    setIsLoadingModel(true);
    setUploadError(null);

    const timer = setTimeout(() => {
      try {
        let loaded: LoadedBimScene;
        if (activeModelKey === 'plant') {
          loaded = BimModelLoader.generateHvacPlantRoomModel();
        } else if (activeModelKey === 'office') {
          loaded = BimModelLoader.generateOfficeFloorModel();
        } else {
          loaded = BimModelLoader.generateBeeTowerModel();
        }

        setBimScene(loaded);
        setSelectedElement(loaded.elements[0] || null);
      } catch (err) {
        console.error('Error generating model:', err);
      } finally {
        setIsLoadingModel(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [activeModelKey]);

  // Handle Drag & Drop / File Upload (.ifc, .gltf, .glb)
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsLoadingModel(true);
    setUploadError(null);

    try {
      const fileNameLower = file.name.toLowerCase();
      let loaded: LoadedBimScene;

      if (fileNameLower.endsWith('.gltf') || fileNameLower.endsWith('.glb')) {
        loaded = await BimModelLoader.loadGltfFile(file);
      } else if (fileNameLower.endsWith('.ifc')) {
        loaded = await BimModelLoader.loadIfcFile(file);
      } else {
        throw new Error('Format de fichier non supporté. Veuillez importer un fichier .ifc, .gltf ou .glb.');
      }

      setBimScene(loaded);
      setActiveModelKey('custom');
      setSelectedElement(loaded.elements[0] || null);
    } catch (err: any) {
      console.error('Error loading BIM file:', err);
      setUploadError(err.message || 'Erreur lors du décodage de la maquette numérique.');
    } finally {
      setIsLoadingModel(false);
    }
  };

  const toggleDiscipline = (disc: BimDiscipline) => {
    setVisibleDisciplines(prev => ({ ...prev, [disc]: !prev[disc] }));
  };

  return (
    <div id="digital-twin-workspace" className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Model Selector */}
      <div className={`p-4 rounded-3xl border shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800 backdrop-blur-xl'
      }`}>
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-lg font-black tracking-tight ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                Jumeau 3D & Visionneuse BIM IFC 4.0
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                WebGL 3D Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Visualisation spatiale, inspection des corps d'état (Murs, Gaines CVC, Canalisations) et synchronisation GMAO.
            </p>
          </div>
        </div>

        {/* Preset Models Dropdown & Custom IFC Upload */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveModelKey('beetower')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeModelKey === 'beetower'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏢 Tour HQE (R+5)
            </button>
            <button
              onClick={() => setActiveModelKey('plant')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeModelKey === 'plant'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏭 Centrale CVC
            </button>
            <button
              onClick={() => setActiveModelKey('office')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeModelKey === 'office'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏬 Plateau R+3
            </button>
          </div>

          {/* Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".ifc,.gltf,.glb"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Importer .IFC / .GLTF</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError(null)} className="underline font-bold">Fermer</button>
        </div>
      )}

      {/* BIM Trade Disciplines & Render Controls Bar */}
      <div className={`p-4 rounded-3xl border shadow-lg space-y-3 ${
        isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800 backdrop-blur-md'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Granular Building Layers Toggle Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Calques :
            </span>

            {/* Murs (Walls) */}
            <button
              onClick={() => toggleLayer('walls')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                layerVisibility.walls 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm' 
                  : 'bg-slate-950/40 text-slate-600 border border-white/5 opacity-50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Murs</span>
            </button>

            {/* Fondations (Foundations) */}
            <button
              onClick={() => toggleLayer('foundations')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                layerVisibility.foundations 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm' 
                  : 'bg-slate-950/40 text-slate-600 border border-white/5 opacity-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Fondations</span>
            </button>

            {/* HVAC */}
            <button
              onClick={() => toggleLayer('hvac')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                layerVisibility.hvac 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' 
                  : 'bg-slate-950/40 text-slate-600 border border-white/5 opacity-50'
              }`}
            >
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gaines CVC</span>
            </button>

            {/* Canalisations */}
            <button
              onClick={() => toggleLayer('plumbing')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                layerVisibility.plumbing 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' 
                  : 'bg-slate-950/40 text-slate-600 border border-white/5 opacity-50'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fluides</span>
            </button>

            {/* Électricité */}
            <button
              onClick={() => toggleLayer('electrical')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                layerVisibility.electrical 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                  : 'bg-slate-950/40 text-slate-600 border border-white/5 opacity-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Électricité</span>
            </button>

            {/* Équipements */}
            <button
              onClick={() => toggleLayer('equipment')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                layerVisibility.equipment 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm' 
                  : 'bg-slate-950/40 text-slate-600 border border-white/5 opacity-50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Équipements</span>
            </button>

            <div className="w-[1px] h-5 bg-white/10 my-auto hidden sm:block" />

            {/* Quick Isolation Shortcuts */}
            <div className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setAllLayers({
                  walls: true,
                  foundations: true,
                  hvac: false,
                  plumbing: false,
                  electrical: false,
                  equipment: false,
                  spaces: false
                })}
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Isoler Murs et Fondations uniquement"
              >
                Structure
              </button>
              <button
                onClick={() => setAllLayers({
                  walls: false,
                  foundations: false,
                  hvac: true,
                  plumbing: true,
                  electrical: true,
                  equipment: true,
                  spaces: false
                })}
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-cyan-300 hover:text-white hover:bg-cyan-900/40 transition-colors"
                title="Isoler l'ensemble des réseaux techniques MEP"
              >
                CVC / MEP
              </button>
              <button
                onClick={() => setAllLayers({
                  walls: false,
                  foundations: true,
                  hvac: true,
                  plumbing: true,
                  electrical: true,
                  equipment: true,
                  spaces: true
                })}
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-amber-300 hover:text-white hover:bg-amber-900/40 transition-colors"
                title="Masquer les murs extérieurs pour voir les gaines intérieures"
              >
                Sans Murs
              </button>
              <button
                onClick={() => setAllLayers({
                  walls: true,
                  foundations: true,
                  hvac: true,
                  plumbing: true,
                  electrical: true,
                  equipment: true,
                  spaces: true
                })}
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-emerald-300 hover:text-white hover:bg-emerald-900/40 transition-colors"
                title="Afficher tous les calques du bâtiment"
              >
                Tout
              </button>
            </div>
          </div>

          {/* Render Mode & Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setRenderMode('pbr')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  renderMode === 'pbr' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Rendu Réaliste Standard"
              >
                PBR
              </button>
              <button
                onClick={() => setRenderMode('xray')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  renderMode === 'xray' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Transparence X-Ray Structurelle"
              >
                X-RAY
              </button>
              <button
                onClick={() => setRenderMode('wireframe')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  renderMode === 'wireframe' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Filaire / Wireframe"
              >
                FILAIRE
              </button>
              <button
                onClick={() => setRenderMode('thermal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  renderMode === 'thermal' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Thermographie & Énergies"
              >
                THERMIQUE
              </button>
              <button
                onClick={() => setRenderMode('clipping')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1 ${
                  renderMode === 'clipping' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Plan de Coupe Dynamique"
              >
                <Scissors className="w-3 h-3" />
                <span>COUPE</span>
              </button>
            </div>

            {/* Measure button */}
            <button
              onClick={() => setIsMeasuring(!isMeasuring)}
              className={`p-2 rounded-xl border transition-all ${
                isMeasuring 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30' 
                  : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Outil de Mesure 3D"
            >
              <Ruler className="w-4 h-4" />
            </button>

            {/* Toggle Spatial Tree */}
            <button
              onClick={() => setShowTree(!showTree)}
              className={`p-2 rounded-xl border transition-all ${
                showTree 
                  ? 'bg-white/15 text-white border-white/20' 
                  : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
              }`}
              title="Afficher/Masquer Arborescence Spatiale"
            >
              <FolderOpen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Clipping Slider when in Clipping Mode */}
        {renderMode === 'clipping' && (
          <div className="pt-2 border-t border-white/5 flex items-center gap-3 text-xs font-mono">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5 shrink-0">
              <Scissors className="w-4 h-4" /> Hauteur de Coupe Y :
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={clippingYPercent}
              onChange={(e) => setClippingYPercent(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <span className="text-white font-bold shrink-0">{clippingYPercent}%</span>
          </div>
        )}
      </div>

      {/* Main 3D Viewport & Split Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Spatial Tree Hierarchy */}
        {showTree && (
          <div className="lg:col-span-3 h-[640px]">
            <BimTreeHierarchy
              elements={bimScene?.elements || []}
              selectedElement={selectedElement}
              onSelectElement={(elem) => setSelectedElement(elem)}
              isLightMode={isLightMode}
            />
          </div>
        )}

        {/* Center: Three.js 3D WebGL Canvas */}
        <div 
          className={`relative ${showTree ? 'lg:col-span-6' : 'lg:col-span-8'}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDraggingFile(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingFile(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
        >
          {isDraggingFile && (
            <div className="absolute inset-0 z-50 bg-slate-950/90 border-2 border-dashed border-emerald-400 rounded-2xl flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-3 animate-bounce">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Déposez votre fichier IFC ici
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Formats acceptés : <strong className="text-emerald-400">.ifc (IFC2x3, IFC4)</strong>, .gltf, .glb. Décodage 3D instantané avec Three.js et web-ifc.
              </p>
            </div>
          )}

          {isLoadingModel ? (
            <div className="w-full h-[580px] sm:h-[640px] rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              <span className="text-xs font-mono text-slate-400">Décodage WebAssembly & Génération de la maquette 3D IFC...</span>
            </div>
          ) : (
            <BimThreeCanvas
              bimScene={bimScene}
              selectedElement={selectedElement}
              onSelectElement={(elem) => setSelectedElement(elem)}
              renderMode={renderMode}
              layerVisibility={layerVisibility}
              onToggleLayer={toggleLayer}
              onSetAllLayers={setAllLayers}
              visibleDisciplines={visibleDisciplines}
              selectedStoreyFilter={selectedStoreyFilter}
              onSelectStorey={(st) => setSelectedStoreyFilter(st)}
              clippingYPercent={clippingYPercent}
              isMeasuring={isMeasuring}
              onOpenTicket={onOpenTicket}
              onInspectAsset={onInspectAsset}
              isLightMode={isLightMode}
            />
          )}
        </div>

        {/* Right: BIM & GMAO Properties Inspector */}
        <div className={showTree ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <div className="h-[640px]">
            <BimPropertiesSidebar
              selectedElement={selectedElement}
              onClose={() => setSelectedElement(null)}
              onOpenTicket={onOpenTicket}
              onInspectAsset={onInspectAsset}
              isLightMode={isLightMode}
            />
          </div>
        </div>
      </div>

      {/* Bottom Metadata & Metrics Bar */}
      {bimScene && (
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 text-xs font-mono ${
          isLightMode ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <strong className="text-white">{bimScene.metadata.name}</strong> ({bimScene.metadata.schemaVersion})
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline">
              Entités IFC : <strong className="text-white">{bimScene.metadata.elementsCount}</strong>
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline">
              Polygones : <strong className="text-white">{bimScene.metadata.polygonsCount.toLocaleString()}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Moteur WebGL Actif (60 FPS)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
              ISO 16739 IFC Standard
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
