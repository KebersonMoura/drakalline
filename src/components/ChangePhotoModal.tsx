import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Check, Sparkles, Link, RotateCcw } from 'lucide-react';
import { storageService } from '../services/storageService';
import { CLINIC_INFO } from '../data/initialData';

interface ChangePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoChanged?: (newPhotoUrl: string) => void;
}

async function compressImageFile(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.85): Promise<string> {
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

export const ChangePhotoModal: React.FC<ChangePhotoModalProps> = ({
  isOpen,
  onClose,
  onPhotoChanged
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [previewPhoto, setPreviewPhoto] = useState<string>(() => storageService.getDoctorPhoto());
  const [inputUrl, setInputUrl] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Professional curated photo presets for medical restoration & tricology clinics
  const presetPhotos = [
    {
      id: 'preset-1',
      title: 'Retrato Médico Elegante 1',
      subtitle: 'Perfil Clínico com Jaleco Branco',
      url: 'https://images.unsplash.com/photo-1594824813589-32e6a715f5f3?auto=format&fit=crop&w=1000&q=85'
    },
    {
      id: 'preset-2',
      title: 'Retrato Médico Elegante 2',
      subtitle: 'Postura Profissional & Acolhedora',
      url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1000&q=85'
    },
    {
      id: 'preset-3',
      title: 'Ilustração Minimalista Original',
      subtitle: 'Vetor Estilizado Original',
      url: '/images/foto-1-destaque.svg'
    }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 15MB.');
      return;
    }

    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 1200, 0.85);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataUrl: compressedDataUrl, filename: file.name })
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            setPreviewPhoto(data.url);
            setIsUploading(false);
            return;
          }
        }
      } catch (uploadErr) {
        console.warn('Upload to /api/upload failed, using compressed preview', uploadErr);
      }

      setPreviewPhoto(compressedDataUrl);
    } catch {
      alert('Erro ao processar a foto.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (inputUrl.trim()) {
      setPreviewPhoto(inputUrl.trim());
      setInputUrl('');
    }
  };

  const handleSave = () => {
    storageService.saveDoctorPhoto(previewPhoto);
    if (onPhotoChanged) {
      onPhotoChanged(previewPhoto);
    }
    setSuccessMsg('Foto atualizada com sucesso!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 900);
  };

  const handleResetToDefault = () => {
    setPreviewPhoto(CLINIC_INFO.doctorPhoto);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2c2724]/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#f4f3eb] rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border-2 border-[#c9bcad] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#c9bcad] flex items-center justify-between bg-white/60">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#3b3530]">
              Alterar Foto Principal
            </h3>
            <p className="text-xs text-[#655d56] mt-0.5">
              Esta foto será exibida no Início (Hero) e na seção Sobre a Dra. Kaline
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#c9bcad]/30 text-[#655d56] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Current / New Preview Frame */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-white rounded-2xl border border-[#c9bcad]/60 shadow-xs">
            <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden shadow-md border-2 border-[#aa907d] bg-[#c9bcad]/20 shrink-0">
              <img
                src={previewPhoto}
                alt="Prévia da Foto"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/foto-1-destaque.svg';
                }}
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                Pré-visualização
              </span>
              <h4 className="font-serif text-base font-semibold text-[#3b3530]">
                Foto da Dra. Kaline
              </h4>
              <p className="text-xs text-[#655d56]">
                Foto com visual limpo e alta definição para transmitir credibilidade médica.
              </p>
              
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1 text-[11px] text-[#aa907d] hover:text-[#967e6c] font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar padrão</span>
              </button>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-2 border-b border-[#c9bcad]/60 pb-3">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'upload'
                  ? 'bg-[#aa907d] text-white shadow-xs'
                  : 'bg-white/60 text-[#655d56] hover:bg-[#c9bcad]/30'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Enviar do Computador</span>
            </button>

            <button
              onClick={() => setActiveTab('url')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'url'
                  ? 'bg-[#aa907d] text-white shadow-xs'
                  : 'bg-white/60 text-[#655d56] hover:bg-[#c9bcad]/30'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>Link / URL</span>
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'presets'
                  ? 'bg-[#aa907d] text-white shadow-xs'
                  : 'bg-white/60 text-[#655d56] hover:bg-[#c9bcad]/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Opções Médicas</span>
            </button>
          </div>

          {/* TAB 1: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#aa907d]/60 hover:border-[#aa907d] rounded-2xl p-8 text-center cursor-pointer bg-white/50 hover:bg-white transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-[#aa907d]/15 text-[#aa907d] flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#3b3530]">
                    Clique para selecionar uma foto
                  </p>
                  <p className="text-xs text-[#655d56] mt-1">
                    Formatos recomendados: JPG, PNG ou WebP (máximo 5MB)
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isUploading}
                  className="px-4 py-2 bg-[#aa907d] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>{isUploading ? 'Processando e enviando foto...' : 'Escolher Arquivo'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: URL */}
          {activeTab === 'url' && (
            <div className="space-y-4 bg-white p-5 rounded-2xl border border-[#c9bcad]/60">
              <label className="block text-xs font-bold text-[#3b3530]">
                Cole o link direto da imagem (URL HTTPS):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://exemplo.com/foto-dra-kaline.jpg"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="flex-1 p-3 bg-[#f4f3eb] border border-[#c9bcad] rounded-xl text-xs text-[#3b3530] focus:outline-none focus:ring-2 focus:ring-[#aa907d]"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 bg-[#3b3530] hover:bg-[#2c2724] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Aplicar
                </button>
              </div>
              <p className="text-[11px] text-[#655d56]">
                Você pode usar fotos hospedadas no Imgur, Cloudinary, AWS S3 ou CDN do Instagram.
              </p>
            </div>
          )}

          {/* TAB 3: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-[#655d56]">
                Selecione uma imagem médica profissional para uso imediato:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {presetPhotos.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => setPreviewPhoto(preset.url)}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer bg-white text-left ${
                      previewPhoto === preset.url
                        ? 'border-[#aa907d] ring-2 ring-[#aa907d]/30 shadow-sm'
                        : 'border-[#c9bcad]/60 hover:border-[#aa907d]/60'
                    }`}
                  >
                    <div className="aspect-3/4 rounded-xl overflow-hidden mb-2 bg-[#c9bcad]/20 border border-[#c9bcad]/40">
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-xs font-semibold text-[#3b3530] line-clamp-1">
                      {preset.title}
                    </p>
                    <p className="text-[10px] text-[#655d56] line-clamp-1">
                      {preset.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>{successMsg}</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-[#c9bcad] bg-white/70 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#c9bcad] hover:bg-[#c9bcad]/20 text-[#655d56] text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#aa907d] hover:bg-[#967e6c] text-[#f4f3eb] text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Nova Foto</span>
          </button>
        </div>

      </div>
    </div>
  );
};
