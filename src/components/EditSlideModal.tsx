import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Upload, Link as LinkIcon, Sparkles, Check, Trash2, Eye } from 'lucide-react';
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
  const [ctaText, setCtaText] = useState('Agendar Consulta');
  const [ctaLink, setCtaLink] = useState('#agendamento');
  const [secondaryCtaText, setSecondaryCtaText] = useState('Falar no WhatsApp');
  const [secondaryCtaLink, setSecondaryCtaLink] = useState('whatsapp');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('presets');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
      // 1. Resize & compress client-side to prevent massive payload & quota issues
      const compressedDataUrl = await compressImageFile(file, 1920, 1080, 0.82);

      // 2. Upload to server endpoint to get a lightweight static URL (/uploads/img_....jpg)
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

      // Fallback: use optimized compressed string
      setImageUrl(compressedDataUrl);
    } catch (err: any) {
      setErrorMsg('Erro ao processar imagem.');
    } finally {
      setIsUploading(false);
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
                Os textos e imagens são salvos e atualizados no banco de dados.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Image Selection Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Imagem de Fundo do Slide
            </label>

            {/* Live Preview */}
            <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-stone-200 bg-stone-950 flex items-center justify-center group">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Preview do Slide"
                    className="w-full h-full object-cover opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent flex flex-col justify-end p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      {badge || 'Pré-visualização'}
                    </span>
                    <h4 className="text-sm font-bold text-white line-clamp-1">
                      {title || 'Título do Slide...'}
                    </h4>
                  </div>
                </>
              ) : (
                <div className="text-center text-stone-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                  <span className="text-xs">Nenhuma imagem selecionada</span>
                </div>
              )}
            </div>

            {/* Tabs for Image Input */}
            <div className="flex border border-stone-200 rounded-xl p-1 bg-stone-50 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'presets' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#aa907d]" />
                <span>Imagens Sugeridas</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'upload' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-stone-700" />
                <span>Enviar do Computador</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'url' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 text-stone-700" />
                <span>Digitar Link URL</span>
              </button>
            </div>

            {/* Tab: Presets */}
            {activeTab === 'presets' && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative h-18 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
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

            {/* Tab: Upload */}
            {activeTab === 'upload' && (
              <div className="border-2 border-dashed border-stone-200 rounded-2xl p-4 text-center bg-stone-50/50 hover:bg-stone-50 transition-colors">
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
                  <span>{isUploading ? 'Otimizando e Enviando Foto...' : 'Escolher Foto do Computador'}</span>
                </label>
                <p className="text-[11px] text-stone-400 mt-2">
                  Formatos JPG, PNG ou WEBP. As imagens são otimizadas automaticamente para máxima performance sem exceder a cota.
                </p>
              </div>
            )}

            {/* Tab: URL */}
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

          {/* Texts Section */}
          <div className="space-y-4 pt-2 border-t border-stone-100">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Tag / Selo do Slide
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
                Frase de Destaque / Citação (Opcional)
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
                Texto Descritivo
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
                  Texto Botão 2 (Secundário)
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
                <span className="text-xs font-semibold text-stone-800">Slide Ativo (visível no topo)</span>
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
