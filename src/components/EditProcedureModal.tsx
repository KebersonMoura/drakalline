import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  Clock, 
  Trash2, 
  Plus, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Procedure } from '../types';

interface EditProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  procedure: Procedure | null; // null means creating a new procedure
  onSave: (procedure: Procedure) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

async function compressImageFile(file: File, maxWidth = 1600, maxHeight = 1000, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

const PRESET_PROCEDURE_IMAGES = [
  {
    name: 'Tricoscopia & Diagnóstico',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    category: 'Diagnóstico'
  },
  {
    name: 'Transplante Capilar FUE',
    url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80',
    category: 'Cirúrgico'
  },
  {
    name: 'MMP® & Microinfusão',
    url: 'https://images.unsplash.com/photo-1512290900672-1f41b2a926a5?auto=format&fit=crop&w=1200&q=80',
    category: 'Regeneração'
  },
  {
    name: 'Laser & Fototerapia',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    category: 'Laser'
  },
  {
    name: 'Dermatologia & Pele',
    url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    category: 'Clínica'
  },
  {
    name: 'Consultório & Atendimento',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    category: 'Ambiente'
  },
  {
    name: 'Cuidado Capilar Feminino',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    category: 'Capilar'
  },
  {
    name: 'Microscopia & Análise Folicular',
    url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1200&q=80',
    category: 'Laboratório'
  }
];

export const EditProcedureModal: React.FC<EditProcedureModalProps> = ({
  isOpen,
  onClose,
  procedure,
  onSave,
  onDelete
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'capilar' | 'facial' | 'rejuvenescimento' | 'corporal'>('capilar');
  const [duration, setDuration] = useState('60 minutos');
  const [downtime, setDowntime] = useState('Sem downtime');
  const [imageUrl, setImageUrl] = useState('');
  const [popular, setPopular] = useState(false);
  
  // Lists
  const [benefits, setBenefits] = useState<string[]>([]);
  const [newBenefit, setNewBenefit] = useState('');
  const [idealFor, setIdealFor] = useState<string[]>([]);
  const [newIdealFor, setNewIdealFor] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [imageTab, setImageTab] = useState<'upload' | 'url' | 'presets'>('presets');
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConfirmDelete(false);
    setIsDeleting(false);
    if (procedure) {
      setTitle(procedure.title || '');
      setSubtitle(procedure.subtitle || '');
      setDescription(procedure.description || '');
      setCategory(procedure.category || 'capilar');
      setDuration(procedure.duration || '60 minutos');
      setDowntime(procedure.downtime || 'Sem downtime');
      setImageUrl(procedure.imageUrl || '');
      setPopular(Boolean(procedure.popular));
      setBenefits(procedure.benefits || []);
      setIdealFor(procedure.idealFor || []);
    } else {
      // Defaults for new procedure
      setTitle('');
      setSubtitle('');
      setDescription('');
      setCategory('capilar');
      setDuration('45 a 60 minutos');
      setDowntime('Sem downtime');
      setImageUrl('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80');
      setPopular(false);
      setBenefits(['Atendimento médico especializado', 'Avaliação e diagnóstico individualizado']);
      setIdealFor(['Queda capilar ou afinamento dos fios']);
    }
    setErrorMsg('');
    setActiveTab('text');
  }, [procedure, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('A imagem deve ter no máximo 15MB.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      // 1. Client-side compression
      const compressedDataUrl = await compressImageFile(file, 1600, 1000, 0.85);

      // 2. Upload to server to get static /uploads/ path
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: compressedDataUrl, filename: file.name })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            setImageUrl(data.url);
            setIsUploading(false);
            return;
          }
        }
      } catch (uploadErr) {
        console.warn('Upload to server failed, using compressed data URL', uploadErr);
      }

      setImageUrl(compressedDataUrl);
    } catch {
      setErrorMsg('Erro ao processar a imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const handleAddIdealFor = () => {
    if (newIdealFor.trim()) {
      setIdealFor([...idealFor, newIdealFor.trim()]);
      setNewIdealFor('');
    }
  };

  const handleRemoveIdealFor = (index: number) => {
    setIdealFor(idealFor.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('O título do procedimento é obrigatório.');
      setActiveTab('text');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('A descrição do procedimento é obrigatória.');
      setActiveTab('text');
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMsg('Selecione ou insira uma foto para o procedimento.');
      setActiveTab('image');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    const updated: Procedure = {
      id: procedure ? procedure.id : 'proc-' + Date.now(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      category,
      duration: duration.trim() || '45 minutos',
      downtime: downtime.trim() || 'Sem downtime',
      idealFor: idealFor.length > 0 ? idealFor : ['Indicado após avaliação médica'],
      benefits: benefits.length > 0 ? benefits : ['Protocolo médico personalizado'],
      imageUrl: imageUrl.trim(),
      popular,
      faq: procedure?.faq || [
        {
          question: 'Como é realizado o procedimento?',
          answer: 'O tratamento é realizado no consultório médico com todo conforto, anestesia tópica quando necessária e acompanhamento minucioso.'
        }
      ]
    };

    try {
      await onSave(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar procedimento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-[#fcfbf7] w-full max-w-3xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-stone-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Cuidados & Procedimentos
              </span>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {procedure ? 'Editar Procedimento / Tratamento' : 'Novo Procedimento / Tratamento'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (Textos vs Foto) */}
        <div className="px-6 pt-3 bg-stone-50 border-b border-stone-200/80 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-stone-900 border-amber-600 shadow-2xs font-bold'
                : 'text-stone-500 border-transparent hover:text-stone-900'
            }`}
          >
            <span>1. Textos e Detalhes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'image'
                ? 'bg-white text-stone-900 border-amber-600 shadow-2xs font-bold'
                : 'text-stone-500 border-transparent hover:text-stone-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>2. Foto do Procedimento</span>
            {imageUrl && <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />}
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: TEXTS & DETAILS */}
          {activeTab === 'text' && (
            <div className="space-y-5">
              
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                    <span>Título do Tratamento *</span>
                    <span className="text-[10px] text-stone-400 font-normal">Exibido em destaque no card</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Tricoscopia Digital & Diagnóstico Capilar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-hidden bg-white shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-hidden bg-white shadow-2xs cursor-pointer"
                  >
                    <option value="capilar">Capilar</option>
                    <option value="facial">Facial / Diagnóstico</option>
                    <option value="rejuvenescimento">Rejuvenescimento</option>
                    <option value="corporal">Corporal</option>
                  </select>
                </div>
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                  <span>Subtítulo / Chamada Curta</span>
                  <span className="text-[10px] text-stone-400 font-normal">Uma frase explicativa</span>
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Exame de alta precisão para identificar as reais causas da queda capilar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-hidden bg-white shadow-2xs"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                  <span>Descrição Detalhada do Tratamento *</span>
                  <span className="text-[10px] text-stone-400 font-normal">Explique o método, segurança e tecnologia</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva detalhadamente como o procedimento funciona, a tecnologia empregada e os objetivos clínicos..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-hidden bg-white shadow-2xs leading-relaxed"
                />
              </div>

              {/* Duration & Downtime */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Duração Média da Sessão</span>
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="Ex: 60 minutos ou 45 minutos"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-stone-900 text-sm focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-hidden bg-white shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800">
                    Recuperação / Downtime
                  </label>
                  <input
                    type="text"
                    value={downtime}
                    onChange={(e) => setDowntime(e.target.value)}
                    placeholder="Ex: Sem downtime (retorno imediato)"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-stone-900 text-sm focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-hidden bg-white shadow-2xs"
                  />
                </div>
              </div>

              {/* Checkbox Popular */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">Destacar como Mais Procurado</h4>
                  <p className="text-[11px] text-stone-500">Exibe uma etiqueta especial de destaque no card deste tratamento</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={popular}
                    onChange={(e) => setPopular(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-700"></div>
                </label>
              </div>

              {/* Benefits List */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                  <span>Benefícios e Diferenciais</span>
                  <span className="text-[10px] text-stone-400">Bullets com check exibidos no card</span>
                </label>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBenefit();
                      }
                    }}
                    placeholder="Adicionar novo benefício (Ex: Freia a queda capilar e estimula novos fios)"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="px-3.5 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-stone-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>

                <div className="space-y-1.5 mt-2">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs text-stone-800">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{b}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(i)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Remover benefício"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ideal For List */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                  <span>Para quem é Indicado?</span>
                  <span className="text-[10px] text-stone-400">Exibido na janela de detalhes</span>
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newIdealFor}
                    onChange={(e) => setNewIdealFor(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddIdealFor();
                      }
                    }}
                    placeholder="Adicionar indicação (Ex: Afinamento dos fios e entradas)"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddIdealFor}
                    className="px-3.5 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 hover:bg-stone-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </div>

                <div className="space-y-1.5 mt-2">
                  {idealFor.map((item, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-stone-200 text-xs text-stone-800">
                      <span>• {item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIdealFor(i)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PHOTO & IMAGE */}
          {activeTab === 'image' && (
            <div className="space-y-5">
              
              {/* Live Preview Card */}
              <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">Prévia Visual do Card</span>
                  <span className="text-[10px] font-medium text-stone-400">Proporção 16:10</span>
                </div>

                <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-stone-900 border border-stone-200">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={title || 'Prévia do procedimento'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-2">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span className="text-xs">Nenhuma foto selecionada</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-xs text-[11px] font-medium text-white border border-white/20 shadow-xs">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {duration || '60 min'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Source Mode Switcher */}
              <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                <button
                  type="button"
                  onClick={() => setImageTab('presets')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    imageTab === 'presets' ? 'bg-[#aa907d] text-white' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  Fotos Selecionadas (Alta Definição)
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    imageTab === 'upload' ? 'bg-[#aa907d] text-white' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  Upload do Computador
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    imageTab === 'url' ? 'bg-[#aa907d] text-white' : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  Link / URL da Imagem
                </button>
              </div>

              {/* Preset Gallery */}
              {imageTab === 'presets' && (
                <div className="space-y-2">
                  <p className="text-xs text-stone-500">
                    Clique em qualquer uma das fotos médicas profissionais abaixo para aplicar imediatamente ao procedimento:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PRESET_PROCEDURE_IMAGES.map((preset, idx) => (
                      <div
                        key={idx}
                        onClick={() => setImageUrl(preset.url)}
                        className={`group cursor-pointer relative aspect-16/10 rounded-xl overflow-hidden border-2 transition-all shadow-2xs ${
                          imageUrl === preset.url ? 'border-amber-700 ring-2 ring-amber-700/20' : 'border-stone-200 hover:border-[#aa907d]'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                          <span className="text-[10px] font-bold text-white line-clamp-1">
                            {preset.name}
                          </span>
                        </div>
                        {imageUrl === preset.url && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload from Computer */}
              {imageTab === 'upload' && (
                <div className="p-6 bg-white rounded-2xl border-2 border-dashed border-stone-300 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Selecione uma foto do seu computador</h4>
                    <p className="text-xs text-stone-500 mt-1">
                      Formatos JPG, PNG ou WEBP. A foto é automaticamente compactada e gravada no servidor sem exceder o limite de armazenamento.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleFileUpload}
                    className="hidden"
                    id="proc-image-upload"
                  />

                  <label
                    htmlFor="proc-image-upload"
                    className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all ${
                      isUploading ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Processando e Enviando Foto...' : 'Escolher Arquivo do Computador'}</span>
                  </label>
                </div>
              )}

              {/* URL input */}
              {imageTab === 'url' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-800">
                    URL direta da Imagem
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://exemplo.com/imagem-procedimento.jpg"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-stone-900 text-sm focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-hidden bg-white shadow-2xs"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Insira o link direto de uma imagem hospedada na web ou no Unsplash.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between shrink-0">
            {procedure && onDelete ? (
              confirmDelete ? (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                  <span className="text-[11px] font-bold text-rose-700">Confirmar exclusão?</span>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={async () => {
                      setIsDeleting(true);
                      try {
                        await onDelete(procedure.id);
                        onClose();
                      } catch (err: any) {
                        setErrorMsg(err?.message || 'Erro ao excluir tratamento.');
                      } finally {
                        setIsDeleting(false);
                      }
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{isDeleting ? 'Excluindo...' : 'Sim, Excluir'}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 text-stone-600 hover:text-stone-900 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Tratamento</span>
                </button>
              )
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || isUploading}
                className="px-5 py-2 bg-[#aa907d] hover:bg-[#967e6d] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'Salvando...' : (procedure ? 'Salvar Alterações' : 'Criar Tratamento')}</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
