import React, { useState } from 'react';
import { 
  Instagram, 
  Heart, 
  MessageCircle, 
  ExternalLink, 
  Sparkles, 
  X, 
  Share2, 
  Check, 
  Eye, 
  Calendar,
  Star
} from 'lucide-react';
import { InstagramPost } from '../types';
import { CLINIC_INFO } from '../data/initialData';
import { storageService } from '../services/storageService';

interface InstagramGalleryProps {
  posts: InstagramPost[];
  onOpenBooking: () => void;
  onGalleryUpdated?: () => void;
}

export const InstagramGallery: React.FC<InstagramGalleryProps> = ({ 
  posts, 
  onOpenBooking 
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [activeModalPost, setActiveModalPost] = useState<InstagramPost | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const tags = ['all', 'Destaque Principal', 'Conduta Médica', 'Diagnóstico & Tricoscopia', 'Autoestima & Saúde'];

  const filteredPosts = selectedTag === 'all'
    ? posts
    : posts.filter(p => {
        const tag = p.procedureTag.toLowerCase();
        if (selectedTag === 'Destaque Principal') return tag.includes('destaque');
        if (selectedTag === 'Conduta Médica') return tag.includes('conduta') || tag.includes('uti');
        if (selectedTag === 'Diagnóstico & Tricoscopia') return tag.includes('achismos') || tag.includes('sinais') || tag.includes('trico');
        if (selectedTag === 'Autoestima & Saúde') return tag.includes('autoestima');
        return true;
      });

  const handleCopyShare = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Find highlight post (post-1)
  const highlightPost = posts.find(p => p.id === 'post-1') || posts[0];
  const remainingPosts = posts.filter(p => p.id !== (highlightPost?.id));

  return (
    <section id="galeria" className="py-16 sm:py-20 bg-[#f4f3eb] border-t border-[#c9bcad] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-[#c9bcad] pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9bcad]/30 border border-[#aa907d]/40 text-[#aa907d] text-xs font-semibold uppercase tracking-wider mb-3">
              <Instagram className="w-3.5 h-3.5 text-[#aa907d]" />
              <span>Conteúdo &amp; Casos Clínicos</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#3b3530]">
              Galeria @{CLINIC_INFO.instagramHandle}
            </h2>
            <p className="text-[#655d56] text-sm sm:text-base mt-2 max-w-xl">
              Publicações reais, reflexões sobre a prática médica, conscientização capilar e casos clínicos direto do perfil da Dra. Kaline.
            </p>
          </div>

          {/* Actions & Profile Link */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={CLINIC_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#aa907d] hover:bg-[#967e6c] text-[#f4f3eb] text-xs font-semibold shadow-xs transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Ver no Instagram</span>
              <ExternalLink className="w-3 h-3 text-[#f4f3eb]/80" />
            </a>
          </div>
        </div>

        {/* Tags Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar text-xs">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#aa907d] text-[#f4f3eb] shadow-xs'
                  : 'bg-[#f4f3eb] text-[#655d56] hover:bg-[#c9bcad]/30 border border-[#c9bcad]'
              }`}
            >
              {tag === 'all' ? 'Todas as 6 Publicações' : tag}
            </button>
          ))}
        </div>

        {/* PHOTO 1 AS HIGHLIGHT (Destaque Principal) */}
        {selectedTag === 'all' && highlightPost && (
          <div className="mb-8 bg-[#c9bcad]/20 rounded-3xl p-6 sm:p-8 border-2 border-[#aa907d] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#aa907d] text-[#f4f3eb] px-4 py-1.5 rounded-bl-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Star className="w-3.5 h-3.5 text-[#f4f3eb] fill-[#f4f3eb]" />
              <span>Publicação em Destaque</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center pt-3 md:pt-0">
              {/* Highlight Image */}
              <div 
                onClick={() => setActiveModalPost(highlightPost)}
                className="md:col-span-5 relative aspect-4/5 rounded-2xl overflow-hidden shadow-md bg-[#c9bcad]/30 cursor-pointer group border-2 border-[#c9bcad]"
              >
                <img
                  src={highlightPost.imageUrl}
                  alt={highlightPost.procedureTag}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-[#2c2724]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#f4f3eb] gap-2 text-sm font-medium">
                  <Eye className="w-5 h-5" />
                  <span>Expandir Foto</span>
                </div>
              </div>

              {/* Highlight Content & Context */}
              <div className="md:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#aa907d]/20 text-[#aa907d] text-xs font-semibold uppercase tracking-wider">
                  <span>{highlightPost.procedureTag}</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#3b3530] leading-tight">
                  Dra. Kaline — Para um diagnóstico preciso
                </h3>

                <p className="text-sm sm:text-base text-[#655d56] leading-relaxed">
                  {highlightPost.caption}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#ada49c] border-t border-[#c9bcad]">
                  <span className="flex items-center gap-1 text-[#aa907d] font-semibold">
                    <Heart className="w-4 h-4 fill-[#aa907d]" />
                    {highlightPost.likes} curtidas
                  </span>
                  <span className="flex items-center gap-1 text-[#655d56]">
                    <MessageCircle className="w-4 h-4" />
                    {highlightPost.commentsCount} comentários
                  </span>
                  <span className="text-[#655d56]">
                    Instagram Oficial • @{CLINIC_INFO.instagramHandle}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={onOpenBooking}
                    className="px-6 py-2.5 bg-[#aa907d] hover:bg-[#967e6c] text-[#f4f3eb] text-xs font-semibold rounded-full shadow-xs transition-colors cursor-pointer"
                  >
                    Agendar Avaliação
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Grid for the Posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(selectedTag === 'all' ? remainingPosts : filteredPosts).map((post, idx) => (
            <div
              key={post.id}
              className="group bg-[#f4f3eb] rounded-2xl overflow-hidden border border-[#c9bcad] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col"
            >
              {/* Image Frame */}
              <div 
                onClick={() => setActiveModalPost(post)}
                className="relative aspect-4/5 bg-[#c9bcad]/30 overflow-hidden cursor-pointer"
              >
                <img
                  src={post.imageUrl}
                  alt={post.procedureTag}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Tag Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-[#2c2724]/80 backdrop-blur-xs text-[#f4f3eb] text-[11px] font-medium px-2.5 py-1 rounded-full border border-white/20">
                    {post.procedureTag}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-[#2c2724]/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center p-5 text-[#f4f3eb] text-center">
                  <div className="flex items-center gap-4 text-sm font-semibold mb-3">
                    <span className="flex items-center gap-1.5 text-[#f4f3eb]">
                      <Heart className="w-4 h-4 text-[#aa907d] fill-[#aa907d]" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1.5 text-[#f4f3eb]">
                      <MessageCircle className="w-4 h-4 text-[#c9bcad]" />
                      {post.commentsCount}
                    </span>
                  </div>
                  <p className="text-xs text-[#f4f3eb]/90 line-clamp-3 px-2 leading-relaxed">
                    {post.caption}
                  </p>
                  <span className="mt-4 text-xs font-semibold text-[#aa907d] bg-[#f4f3eb] px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                    <Eye className="w-3.5 h-3.5" />
                    Expandir Post
                  </span>
                </div>
              </div>

              {/* Card Footer with Quick Caption */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#c9bcad]/10 border-t border-[#c9bcad]/60">
                <p className="text-xs text-[#4a433d] font-medium line-clamp-2 leading-relaxed">
                  {post.caption}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#c9bcad]/40 text-[11px]">
                  <span className="text-[#aa907d] font-semibold">
                    @{CLINIC_INFO.instagramHandle}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center bg-[#c9bcad]/20 rounded-3xl p-8 border border-[#c9bcad] max-w-2xl mx-auto space-y-4">
          <Instagram className="w-8 h-8 text-[#aa907d] mx-auto" />
          <h3 className="font-serif text-2xl font-semibold text-[#3b3530]">
            Acompanhe a rotina médica no Instagram
          </h3>
          <p className="text-[#655d56] text-sm max-w-md mx-auto">
            Novos conteúdos sobre saúde e restauração capilar, tricoscopia e orientações com a Dra. Kaline.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={CLINIC_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#aa907d] hover:bg-[#967e6c] text-[#f4f3eb] font-semibold text-xs rounded-full shadow-xs transition-colors"
            >
              <Instagram className="w-4 h-4" />
              <span>Seguir @{CLINIC_INFO.instagramHandle}</span>
            </a>
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3b3530] hover:bg-[#2c2724] text-[#f4f3eb] font-semibold text-xs rounded-full shadow-xs transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#c9bcad]" />
              <span>Agendar Consulta</span>
            </button>
          </div>
        </div>

      </div>

      {/* Post Detail Modal */}
      {activeModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2c2724]/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#f4f3eb] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative border-2 border-[#c9bcad]">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveModalPost(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-[#2c2724]/60 text-white hover:bg-[#2c2724] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Big Photo */}
            <div className="md:w-7/12 bg-[#2c2724] flex items-center justify-center p-2">
              <img
                src={activeModalPost.imageUrl}
                alt={activeModalPost.procedureTag}
                className="max-h-[50vh] md:max-h-[80vh] w-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right: Instagram Info */}
            <div className="md:w-5/12 p-6 flex flex-col justify-between bg-[#f4f3eb]">
              <div>
                {/* Doctor Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-[#c9bcad]">
                  <div className="w-10 h-10 rounded-full border-2 border-[#aa907d] overflow-hidden">
                    <img
                      src={storageService.getDoctorPhoto()}
                      alt="Dra. Kaline"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#3b3530]">@{CLINIC_INFO.instagramHandle}</h4>
                    <p className="text-xs text-[#aa907d] font-medium">{activeModalPost.procedureTag}</p>
                  </div>
                </div>

                {/* Caption Body */}
                <div className="py-4 text-xs sm:text-sm text-[#4a433d] space-y-3 max-h-[40vh] overflow-y-auto leading-relaxed">
                  <p>{activeModalPost.caption}</p>
                  <p className="text-[#ada49c] text-xs italic">{activeModalPost.date}</p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#c9bcad] space-y-3">
                <div className="flex items-center justify-between text-xs text-[#655d56]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[#aa907d] font-semibold">
                      <Heart className="w-4 h-4 fill-[#aa907d]" />
                      {activeModalPost.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {activeModalPost.commentsCount}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopyShare(activeModalPost.instagramUrl)}
                    className="flex items-center gap-1 text-[#aa907d] hover:underline cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link copiado!' : 'Compartilhar'}</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setActiveModalPost(null);
                      onOpenBooking();
                    }}
                    className="w-full py-3 bg-[#aa907d] hover:bg-[#967e6c] text-[#f4f3eb] font-semibold text-xs rounded-xl transition-colors text-center cursor-pointer shadow-xs"
                  >
                    Agendar Consulta
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
};
