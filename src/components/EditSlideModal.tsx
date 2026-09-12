import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Upload, Link as LinkIcon, Sparkles, Check, Trash2, Smartphone, Monitor } from 'lucide-react';
import { HeroSlide } from '../types';

interface EditSlideModalProps {
  isOpen: boolean;
  slide: HeroSlide | null;
  onClose: () => void;
  onSave: (slideData: HeroSlide) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

async function compressImageFile(file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.82): Promise<string> {
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

const PRESET_IMAGES = [
  {
    name: 'Consulta & Dra. Kaline',
    url: 'https://images.unsplash.com/photo-1594824813589-32e6a715f5f3?auto=format&fit=crop&w=1400&q=85'
  },
  {
    name: 'Tricoscopia & Diagnóstico',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=85'
  },
  {
    name: 'Procedimentos & Lasers',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1400&q=85'
  },
  {
    name: 'Ambiente Médico Moderno',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1400&q=85'
  },
  {
    name: 'Clínica & Conforto',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1400&q=85'
  }
];

const PRESET_MOBILE_IMAGES = [
  {
    name: 'Consulta Médica (Vertical)',
    url: 'https://images.unsplash.com/photo-1594824813589-32e6a715f5f3?auto=format&fit=crop&w=800&q=85'
  },
  {
    name: 'Tricoscopia Digital (Vertical)',
    url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=85'
  },
  {
    name: 'MMP & Lasers (Vertical)',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=85'
  },
  {
    name: 'Consultório Moderno (Vertical)',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=85'
  },
  {
    name: 'Cuidado & Saúde (Vertical)',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=85'
  }
];

export const EditSlideModal: React.FC<EditSlideModalProps> = ({
  isOpen,
  slide,
  onClose,
  onSave,
  onDelete
}) => {
  const [badge, setBadge] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [quote, setQuote] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Mobile specific settings
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [mobileTitle, setMobileTitle] = useState('');
  const [mobileSubtitle, setMobileSubtitle] = useState('');

  const [ctaText, setCtaText] = useState('Agendar Consulta');
  const [ctaLink, setCtaLink] = useState('#agendamento');
  const [secondaryCtaText, setSecondaryCtaText] = useState('Falar no WhatsApp');
  const [secondaryCtaLink, setSecondaryCtaLink] = useState('whatsapp');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('presets');
  const [mobileActiveTab, setMobileActiveTab] = useState<'upload' | 'url' | 'presets'>('presets');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setConfirmDelete(false);
    setIsDeleting(false);
    if (slide) {
      setBadge(slide.badge || '');
      setTitle(slide.title || '');
      setSubtitle(slide.subtitle || '');
      setQuote(slide.quote || '');
      setImageUrl(slide.imageUrl || '');
      setMobileImageUrl(slide.mobileImageUrl || '');
      setMobileTitle(slide.mobileTitle || '');
      setMobileSubtitle(slide.mobileSubtitle || '');
      setCtaText(slide.ctaText || 'Agendar Consulta');
      setCtaLink(slide.ctaLink || '#agendamento');
      setSecondaryCtaText(slide.secondaryCtaText || 'Falar no WhatsApp');
      setSecondaryCtaLink(slide.secondaryCtaLink || 'whatsapp');
      setOrder(slide.order ?? 1);
      setIsActive(slide.isActive !== false);
    } else {
      setBadge('Diagnóstico Preciso & Restauração');
      setTitle('');
      setSubtitle('');
      setQuote('');
      setImageUrl(PRESET_IMAGES[0].url);
      setMobileImageUrl(PRESET_MOBILE_IMAGES[0].url);
      setMobileTitle('');
      setMobileSubtitle('');
      setCtaText('Agendar Consulta');
      setCtaLink('#agendamento');
      setSecondaryCtaText('Falar no WhatsApp');
      setSecondaryCtaLink('whatsapp');
      setOrder(1);
      setIsActive(true);
    }
    setErrorMsg('');
  }, [slide, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('A imagem deve ter no máximo 15MB.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const compressedDataUrl = await compressImageFile(file, 1920, 1080, 0.82);

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
        console.warn('Server upload failed, falling back to optimized data URL', uploadErr);
      }

      setImageUrl(compressedDataUrl);
    } catch (err: any) {
      setErrorMsg('Erro ao processar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleMobileFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, selecione um arquivo de imagem válido para mobile (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('A imagem deve ter no máximo 15MB.');
      return;
    }

    setIsUploadingMobile(true);
    setErrorMsg('');

    try {
      const compressedDataUrl = await compressImageFile(file, 1080, 1920, 0.82);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: compressedDataUrl, filename: 'mobile_' + file.name })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            setMobileImageUrl(data.url);
            setIsUploadingMobile(false);
            return;
          }
        }
      } catch (uploadErr) {
        console.warn('Server upload failed, falling back to data URL', uploadErr);
      }

      setMobileImageUrl(compressedDataUrl);
    } catch (err: any) {
      setErrorMsg('Erro ao processar imagem mobile.');
    } finally {
      setIsUploadingMobile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('O título do slide é obrigatório.');
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMsg('A imagem de fundo do slide é obrigatória.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: slide?.id || 'slide-' + Date.now(),
        badge: badge.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        quote: quote.trim(),
        imageUrl: imageUrl.trim(),
        mobileImageUrl: mobileImageUrl.trim(),
        mobileTitle: mobileTitle.trim(),
        mobileSubtitle: mobileSubtitle.trim(),
        ctaText: ctaText.trim() || 'Agendar Consulta',
        ctaLink: ctaLink.trim() || '#agendamento',
        secondaryCtaText: secondaryCtaText.trim() || 'Falar no WhatsApp',
        secondaryCtaLink: secondaryCtaLink.trim() || 'whatsapp',
        order: Number(order) || 1,
        isActive
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar o slide no banco de dados.');
    } finally {
      setSaving(false);
    }
  };

  const effectiveMobileImage = mobileImageUrl || imageUrl;
  const effectiveMobileTitle = mobileTitle || title || 'Título no Celular...';
  const effectiveMobileMessage = mobileSubtitle || subtitle || 'Pequena mensagem objetiva...';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#f4f3eb]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#aa907d]/20 flex items-center justify-center text-[#aa907d]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {slide ? 'Editar Slide do Topo' : 'Novo Slide do Topo (Carrossel)'}
              </h3>
              <p className="text-xs text-stone-500">
                Configure as imagens e textos para Computador e Celular (Mobile).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/60 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Interactive Live Preview Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Pré-visualização em Tempo Real
              </span>
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Computador</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Celular (Mobile)</span>
                </button>
              </div>
            </div>

            {/* Desktop Preview Frame */}
            {previewDevice === 'desktop' && (
              <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 flex items-center justify-center group shadow-xs">
                {imageUrl ? (
                  <>
                    <img
                      src={imageUrl}
                      alt="Preview do Slide Desktop"
                      className="w-full h-full object-cover opacity-85"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent flex flex-col justify-end p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        {badge || 'Pré-visualização Desktop'}
                      </span>
                      <h4 className="text-sm font-bold text-white line-clamp-1 font-serif">
                        {title || 'Título do Slide...'}
                      </h4>
                      {subtitle && (
                        <p className="text-[11px] text-stone-300 line-clamp-1 mt-0.5">
                          {subtitle}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-stone-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-xs">Nenhuma imagem desktop selecionada</span>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Preview Frame */}
            {previewDevice === 'mobile' && (
              <div className="relative h-56 max-w-[280px] mx-auto rounded-3xl overflow-hidden border-4 border-stone-800 bg-stone-950 flex flex-col justify-end shadow-xl">
                {/* Mobile top speaker notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-stone-800 rounded-full z-20" />
                
                {effectiveMobileImage ? (
                  <>
                    <img
                      src={effectiveMobileImage}
                      alt="Preview do Slide Mobile"
                      className="absolute inset-0 w-full h-full object-cover object-[72%_center] animate-pan-mobile opacity-85"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/50 to-transparent" />
                    
                    <div className="relative z-10 p-4 space-y-1.5 text-left">
                      <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded-sm">
                        Modo Mobile
                      </span>
                      <h4 className="text-xs font-bold text-white font-serif leading-tight line-clamp-2">
                        {effectiveMobileTitle}
                      </h4>
                      <p className="text-[10px] text-stone-300 leading-snug line-clamp-2">
                        {effectiveMobileMessage}
                      </p>
                      <div className="pt-1">
                        <span className="block text-center py-1 rounded-full bg-[#aa907d] text-white text-[9px] font-semibold">
                          {ctaText || 'Agendar Consulta'}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-stone-400 p-6">
                    <Smartphone className="w-8 h-8 mx-auto mb-1 opacity-50" />
                    <span className="text-xs">Nenhuma imagem mobile selecionada</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 1: Desktop Image Setup */}
          <div className="p-4 bg-stone-50/70 rounded-2xl border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-[#aa907d]" />
                <span>Imagem Principal (Computador / Padrão)</span>
              </label>
              <span className="text-[11px] text-stone-500">Recomendado: 1920x1080 (Horizontal)</span>
            </div>

            {/* Tabs for Desktop Image */}
            <div className="flex border border-stone-200 rounded-xl p-1 bg-white text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'presets' ? 'bg-[#aa907d] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sugeridas</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'upload' ? 'bg-[#aa907d] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Do Computador</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'url' ? 'bg-[#aa907d] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Link URL</span>
              </button>
            </div>

            {/* Desktop: Presets */}
            {activeTab === 'presets' && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      imageUrl === preset.url ? 'border-[#aa907d] scale-105 shadow-md' : 'border-stone-200 hover:border-stone-400 opacity-80'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    {imageUrl === preset.url && (
                      <div className="absolute inset-0 bg-[#aa907d]/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow-sm" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Desktop: Upload */}
            {activeTab === 'upload' && (
              <div className="border-2 border-dashed border-stone-200 rounded-2xl p-4 text-center bg-white hover:bg-stone-50/50 transition-colors">
                <input
                  type="file"
                  id="slide-image-upload"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="slide-image-upload"
                  className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-opacity ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Otimizando e Enviando...' : 'Escolher Foto do Computador'}</span>
                </label>
                <p className="text-[11px] text-stone-400 mt-2">
                  Formatos JPG, PNG ou WEBP. Imagem otimizada automaticamente para carregamento ultrarrápido.
                </p>
              </div>
            )}

            {/* Desktop: URL */}
            {activeTab === 'url' && (
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem-do-slide.jpg"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#aa907d]"
              />
            )}
          </div>

          {/* Section 2: Mobile Image & Minimal Layout Customization */}
          <div className="p-4 bg-gradient-to-br from-amber-50/40 via-[#fbf9f6] to-white rounded-2xl border border-amber-200/60 shadow-2xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-amber-100/80 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#aa907d] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Personalização para Celular (Mobile)
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Defina foto vertical, título direto e mensagem curta para quem acessa pelo celular.
                  </p>
                </div>
              </div>

              {mobileImageUrl && (
                <button
                  type="button"
                  onClick={() => setMobileImageUrl('')}
                  className="text-[11px] text-stone-500 hover:text-rose-600 underline cursor-pointer self-start sm:self-auto"
                >
                  Usar mesma foto do desktop
                </button>
              )}
            </div>

            {/* Tabs for Mobile Image */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                Foto para Mobile {mobileImageUrl ? '(Personalizada)' : '(Usando foto padrão do desktop)'}
              </label>

              <div className="flex border border-stone-200 rounded-xl p-1 bg-white text-xs">
                <button
                  type="button"
                  onClick={() => setMobileActiveTab('presets')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mobileActiveTab === 'presets' ? 'bg-[#aa907d] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fotos Verticais</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileActiveTab('upload')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mobileActiveTab === 'upload' ? 'bg-[#aa907d] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Enviar Foto Vertical</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileActiveTab('url')}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mobileActiveTab === 'url' ? 'bg-[#aa907d] text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Link URL</span>
                </button>
              </div>

              {/* Mobile: Presets */}
              {mobileActiveTab === 'presets' && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                  {PRESET_MOBILE_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMobileImageUrl(preset.url)}
                      className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        mobileImageUrl === preset.url ? 'border-[#aa907d] scale-105 shadow-md' : 'border-stone-200 hover:border-stone-400 opacity-80'
                      }`}
                      title={preset.name}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                      {mobileImageUrl === preset.url && (
                        <div className="absolute inset-0 bg-[#aa907d]/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-sm" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Mobile: Upload */}
              {mobileActiveTab === 'upload' && (
                <div className="border-2 border-dashed border-stone-200 rounded-2xl p-4 text-center bg-white hover:bg-stone-50/50 transition-colors">
                  <input
                    type="file"
                    id="slide-mobile-image-upload"
                    accept="image/*"
                    disabled={isUploadingMobile}
                    onChange={handleMobileFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="slide-mobile-image-upload"
                    className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-opacity ${
                      isUploadingMobile ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingMobile ? 'Otimizando Imagem...' : 'Escolher Foto Vertical (Celular)'}</span>
                  </label>
                  <p className="text-[11px] text-stone-400 mt-2">
                    Dica: Escolha fotos tiradas em formato vertical (retrato) para encaixe perfeito na tela do celular.
                  </p>
                </div>
              )}

              {/* Mobile: URL */}
              {mobileActiveTab === 'url' && (
                <input
                  type="url"
                  value={mobileImageUrl}
                  onChange={(e) => setMobileImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem-vertical-mobile.jpg"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#aa907d]"
                />
              )}
            </div>

            {/* Mobile Title & Short Message Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Título para Celular (Opcional)
                </label>
                <input
                  type="text"
                  value={mobileTitle}
                  onChange={(e) => setMobileTitle(e.target.value)}
                  placeholder="Deixe em branco para usar o título principal"
                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#aa907d] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Pequena Mensagem para Celular (Opcional)
                </label>
                <input
                  type="text"
                  value={mobileSubtitle}
                  onChange={(e) => setMobileSubtitle(e.target.value)}
                  placeholder="Mensagem curta (1 a 2 linhas)"
                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#aa907d] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 3: General Slide Texts (Desktop & General) */}
          <div className="space-y-4 pt-2 border-t border-stone-100">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Tag / Selo do Slide (Desktop)
                </label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="Ex: Diagnóstico Preciso & Saúde Capilar"
                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#aa907d] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Ordem de Exibição
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#aa907d] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Título Principal (Headline) *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Especialista em saúde e restauração capilar."
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-serif font-bold focus:ring-2 focus:ring-[#aa907d] focus:outline-hidden text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Frase de Destaque / Citação (Opcional - Desktop)
              </label>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Ex: “Para um diagnóstico preciso.”"
                className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs italic focus:ring-2 focus:ring-[#aa907d] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Texto Descritivo Completo (Desktop)
              </label>
              <textarea
                rows={2}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Avaliação minuciosa com tricoscopia digital de alta resolução..."
                className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#aa907d] focus:outline-hidden"
              />
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Texto Botão 1 (Principal)
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Ex: Agendar Consulta"
                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#aa907d] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Texto Botão 2 (Secundário - Desktop)
                </label>
                <input
                  type="text"
                  value={secondaryCtaText}
                  onChange={(e) => setSecondaryCtaText(e.target.value)}
                  placeholder="Ex: Falar no WhatsApp"
                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#aa907d] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#aa907d] rounded-sm focus:ring-[#aa907d]"
                />
                <span className="text-xs font-semibold text-stone-800">Slide Ativo (visível no carrossel)</span>
              </label>

              {slide && onDelete && (
                confirmDelete ? (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                    <span className="text-[11px] font-bold text-rose-700">Confirmar exclusão?</span>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={async () => {
                        setIsDeleting(true);
                        try {
                          await onDelete(slide.id);
                          onClose();
                        } catch (err: any) {
                          setErrorMsg(err?.message || 'Erro ao excluir slide.');
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
                    className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Slide</span>
                  </button>
                )
              )}
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#aa907d] hover:bg-[#967e6c] text-[#f4f3eb] text-xs font-semibold shadow-md cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando no Banco...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Salvar Slide no Banco</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
