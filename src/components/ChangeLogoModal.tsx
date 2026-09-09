import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Check, Sparkles, Link, RotateCcw, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';

interface ChangeLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoChanged?: (newLogoUrl: string) => void;
}

export const ChangeLogoModal: React.FC<ChangeLogoModalProps> = ({
  isOpen,
  onClose,
  onLogoChanged
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [previewLogo, setPreviewLogo] = useState<string>(() => storageService.getClinicLogo());
  const [inputUrl, setInputUrl] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Preset transparent monograms for Dra. Kaline
  const presetLogos = [
    {
      id: 'preset-gold-k',
      title: 'Monograma Ouro Elegante',
      subtitle: 'Emblema "K" circular dourado com serifa clássica',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 80" width="280" height="80"><circle cx="40" cy="40" r="32" fill="%23aa907d"/><text x="40" y="49" font-family="serif" font-size="28" font-weight="bold" fill="%23ffffff" text-anchor="middle">K</text><text x="85" y="42" font-family="serif" font-size="24" font-weight="bold" fill="%233b3530">Dra. Kaline</text><text x="86" y="58" font-family="sans-serif" font-size="10" font-weight="500" letter-spacing="2" fill="%23857b74">SAÚDE %26 RESTAURAÇÃO CAPILAR</text></svg>'
    },
    {
      id: 'preset-minimalist-dark',
      title: 'Linha Fina Minimalista',
      subtitle: 'Monograma horizontal moderno com folha estilizada',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 70" width="260" height="70"><path d="M25 15 C45 15, 55 35, 55 55 C35 55, 25 35, 25 15 Z" fill="none" stroke="%23aa907d" stroke-width="2.5"/><path d="M25 55 C35 35, 45 25, 55 15" fill="none" stroke="%23aa907d" stroke-width="2"/><text x="75" y="38" font-family="serif" font-size="22" font-weight="600" fill="%232c2724">Dra. Kaline</text><text x="76" y="54" font-family="sans-serif" font-size="9" font-weight="600" letter-spacing="1.5" fill="%23aa907d">TRICOLOGIA %26 MEDICINA</text></svg>'
    },
    {
      id: 'preset-luxury-crest',
      title: 'Brasão Dourado Premium',
      subtitle: 'Símbolo com coroa de louros e linhas médicas',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 75" width="270" height="75"><rect x="10" y="10" width="50" height="50" rx="14" fill="%233b3530"/><text x="35" y="44" font-family="serif" font-size="26" font-weight="bold" fill="%23d4af37" text-anchor="middle">K</text><text x="75" y="38" font-family="serif" font-size="23" font-weight="700" fill="%23aa907d">Dra. Kaline</text><text x="76" y="54" font-family="sans-serif" font-size="9" font-weight="600" letter-spacing="2" fill="%23655d56">CLÍNICA CAPILAR</text></svg>'
    }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor, selecione um arquivo de imagem válido (recomendado .png com transparência).');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const reader = new FileReader();
      reader.onerror = () => {
        setErrorMsg('Erro ao ler o arquivo selecionado.');
        setIsUploading(false);
      };

      reader.onload = async () => {
        const dataUrl = reader.result as string;
        setPreviewLogo(dataUrl);

        // Upload to server endpoint to save as transparent PNG file in /uploads
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dataUrl,
              filename: file.name
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              setPreviewLogo(data.url);
            }
          }
        } catch {
          // If offline or upload fails, dataUrl remains as valid fallback
        } finally {
          setIsUploading(false);
        }
      };

      reader.readAsDataURL(file);
    } catch {
      setErrorMsg('Falha ao processar imagem.');
      setIsUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (!inputUrl.trim()) return;
    setPreviewLogo(inputUrl.trim());
    setInputUrl('');
    setErrorMsg('');
  };

  const handleSelectPreset = (url: string) => {
    setPreviewLogo(url);
    setErrorMsg('');
  };

  const handleResetToDefault = () => {
    setPreviewLogo('');
    setErrorMsg('');
  };

  const handleSave = () => {
    storageService.saveClinicLogo(previewLogo);
    if (onLogoChanged) {
      onLogoChanged(previewLogo);
    }
    setSuccessMsg(previewLogo ? 'Logo em PNG transparente atualizada com sucesso!' : 'Logo redefinida para o padrão do site!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#aa907d]/30 text-[#aa907d] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">Logo do Site (PNG Transparente)</h3>
              <p className="text-[11px] text-stone-400">Personalize a logomarca exibida no topo e no rodapé</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-500 text-white px-6 py-2.5 text-xs font-semibold flex items-center gap-2 justify-center shrink-0">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-500 text-white px-6 py-2.5 text-xs font-semibold flex items-center gap-2 justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Dual Transparency Preview Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Pré-visualização da Logo</span>
                <span className="text-[10px] lowercase font-normal px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  fundo transparente
                </span>
              </label>
              {previewLogo && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Remover Logo / Voltar ao Padrão</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Light Background Preview (Simulates Navbar) */}
              <div className="rounded-2xl border border-stone-200 p-3.5 bg-[#f4f3eb] relative overflow-hidden">
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/10 text-stone-700 text-[10px] font-bold">
                  Modo Claro (Cabeçalho)
                </div>
                <div 
                  className="h-28 w-full flex items-center justify-center pt-5 rounded-xl"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.03) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.03) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.03) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.03) 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                  }}
                >
                  {previewLogo ? (
                    <img
                      src={previewLogo}
                      alt="Prévia Logo Clara"
                      className="max-h-16 max-w-[85%] object-contain drop-shadow-xs"
                      onError={() => setErrorMsg('Não foi possível carregar a imagem.')}
                    />
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#aa907d] text-white flex items-center justify-center font-serif font-bold text-sm">
                        K
                      </div>
                      <div className="font-serif font-semibold text-lg text-[#3b3530]">
                        Dra. Kaline
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dark Background Preview (Simulates Footer) */}
              <div className="rounded-2xl border border-stone-700 p-3.5 bg-[#2c2724] relative overflow-hidden text-white">
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/10 text-stone-200 text-[10px] font-bold">
                  Modo Escuro (Rodapé)
                </div>
                <div 
                  className="h-28 w-full flex items-center justify-center pt-5 rounded-xl"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.04) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.04) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.04) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.04) 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                  }}
                >
                  {previewLogo ? (
                    <img
                      src={previewLogo}
                      alt="Prévia Logo Escura"
                      className="max-h-16 max-w-[85%] object-contain drop-shadow-xs"
                    />
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#aa907d] text-white flex items-center justify-center font-serif font-bold text-sm">
                        K
                      </div>
                      <div className="font-serif font-semibold text-lg text-[#f4f3eb]">
                        Dra. Kaline
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-500">
              💡 Para melhor resultado, envie um arquivo <strong className="text-stone-700">.PNG com fundo transparente</strong> (PNG-24/PNG-32). O fundo quadriculado indica a área transparente.
            </p>
          </div>

          {/* Navigation Tabs for Insertion Method */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload de Arquivo PNG</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>Link / URL Direta</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Monogramas da Clínica</span>
            </button>
          </div>

          {/* TAB 1: File Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/webp,image/svg+xml,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-[#aa907d] bg-stone-50 hover:bg-stone-100/70 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#aa907d]/15 text-[#aa907d] flex items-center justify-center mx-auto shadow-2xs">
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-[#aa907d] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800">
                    Clique para selecionar a Logo em PNG do computador
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Suporta <span className="font-semibold text-stone-700">PNG com fundo transparente</span>, WebP ou SVG
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] text-[#aa907d] font-semibold bg-white px-3 py-1 rounded-full border border-stone-200 shadow-2xs">
                  <span>Procurar nos arquivos...</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: URL Input */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-700">
                Endereço Web da Imagem (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://exemplo.com/logo-dra-kaline-transparente.png"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#aa907d]"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={!inputUrl.trim()}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Carregar
                </button>
              </div>
              <p className="text-[11px] text-stone-400">
                Insira o link direto de uma imagem hospedada no seu servidor ou CDN.
              </p>
            </div>
          )}

          {/* TAB 3: Curated Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500">
                Modelos prontos e elegantes com transparência nativa para a identidade da Dra. Kaline:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {presetLogos.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      previewLogo === preset.url
                        ? 'border-[#aa907d] bg-[#aa907d]/10 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-28 h-12 bg-white rounded-xl border border-stone-200 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs">
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">{preset.title}</h4>
                        <p className="text-[11px] text-stone-500">{preset.subtitle}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        previewLogo === preset.url
                          ? 'bg-[#aa907d] text-white'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {previewLogo === preset.url ? 'Selecionado' : 'Usar'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isUploading}
            className="px-6 py-2.5 bg-[#aa907d] hover:bg-[#967e6c] disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Logo do Site</span>
          </button>
        </div>

      </div>
    </div>
  );
};
