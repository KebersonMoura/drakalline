import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Share2, 
  Check, 
  MessageCircle, 
  UserCheck 
} from 'lucide-react';
import { BlogPost } from '../types';
import { CLINIC_INFO } from '../data/initialData';

interface BlogSectionProps {
  posts: BlogPost[];
  onOpenBooking: () => void;
}

export const BlogSection: React.FC<BlogSectionProps> = ({ posts, onOpenBooking }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedPost?.title || 'Cuidados Pós-Procedimento - Dra. Kaline',
        text: selectedPost?.summary,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <section id="blog" className="py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>Guia do Paciente & Autocuidado</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900">
            Blog: Cuidados Pós-Procedimento
          </h2>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
            Orientações fundamentais escritas pela Dra. Kaline para potencializar a recuperação, evitar intercorrências e garantir a durabilidade máxima dos seus resultados.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="bg-white rounded-3xl overflow-hidden border border-stone-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="aspect-16/10 overflow-hidden bg-stone-100 relative">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    {post.category}
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                    <span>•</span>
                    <span>{post.publishedAt}</span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-stone-900 group-hover:text-amber-900 transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="px-5 pb-5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-amber-900 group-hover:text-amber-700">
                <span>Ler orientações completas</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Full Article Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              
              {/* Header Info */}
              <div className="space-y-2 pr-8">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-full">
                  <span>{selectedPost.category}</span>
                  <span>•</span>
                  <span>{selectedPost.readTime}</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-snug">
                  {selectedPost.title}
                </h3>
                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={selectedPost.author.avatar}
                    alt={selectedPost.author.name}
                    className="w-9 h-9 rounded-full object-cover border border-amber-600"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">{selectedPost.author.name}</span>
                    <span className="text-[10px] text-stone-500">{selectedPost.author.role}</span>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="aspect-16/9 rounded-2xl overflow-hidden bg-stone-100">
                <img
                  src={selectedPost.coverImage}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Key Care Checklist Callout */}
              {selectedPost.keyCareTips && selectedPost.keyCareTips.length > 0 && (
                <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-950 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-700" />
                    <span>Checklist de Cuidados Essenciais:</span>
                  </h4>
                  <ul className="space-y-2">
                    {selectedPost.keyCareTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-stone-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Body Content */}
              <div className="prose prose-stone max-w-none text-xs sm:text-sm text-stone-700 leading-relaxed space-y-4 whitespace-pre-line">
                {selectedPost.content}
              </div>

              {/* WhatsApp Doubt Help Banner */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-stone-900">Ficou com alguma dúvida sobre seu procedimento?</h5>
                    <p className="text-[11px] text-stone-600">Nossa equipe médica está disponível para orientar você.</p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${CLINIC_INFO.whatsappNumber}?text=Ol%C3%A1%20Dra.%20Kaline!%20Li%20o%20artigo%20sobre%20${encodeURIComponent(selectedPost.title)}%20e%20gostaria%20de%20uma%20orienta%C3%A7%C3%A3o.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shrink-0 transition-colors"
                >
                  Tirar Dúvida no WhatsApp
                </a>
              </div>

              {/* Footer Modal Actions */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link copiado!' : 'Compartilhar artigo'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-full"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPost(null);
                      onOpenBooking();
                    }}
                    className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-full"
                  >
                    Agendar Procedimento
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
