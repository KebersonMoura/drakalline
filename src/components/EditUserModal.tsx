import React, { useState, useEffect } from 'react';
import { X, Key, User, ShieldCheck, Eye, EyeOff, Save, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { AdminUser } from '../types';

interface EditUserModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSave: (userData: { id?: string; username: string; password?: string; name: string; role?: string }) => Promise<void>;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Administrador');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isEditing = Boolean(user && user.id);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      if (user) {
        setName(user.name || '');
        setUsername(user.username || '');
        setPassword(user.password || '');
        setConfirmPassword(user.password || '');
        setRole(user.role || 'Administrador');
      } else {
        setName('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setRole('Administrador');
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanUser = username.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPass = password.trim();

    if (!cleanName) {
      setErrorMessage('Por favor, informe o nome completo.');
      return;
    }

    if (cleanUser.length < 3) {
      setErrorMessage('O nome de usuário/login deve ter pelo menos 3 caracteres.');
      return;
    }

    // If new user or password is being changed
    if (!isEditing || cleanPass) {
      if (cleanPass.length < 4) {
        setErrorMessage('A senha deve ter pelo menos 4 caracteres.');
        return;
      }
      if (cleanPass !== confirmPassword.trim()) {
        setErrorMessage('As senhas digitadas não coincidem.');
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave({
        id: user?.id,
        username: cleanUser,
        password: cleanPass || undefined,
        name: cleanName,
        role
      });
      setSuccessMessage('Dados salvos no banco de dados com sucesso!');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar dados no banco.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">
                {isEditing ? 'Alterar Login e Senha' : 'Novo Usuário de Acesso'}
              </h3>
              <p className="text-xs text-stone-400">
                {isEditing 
                  ? 'Atualize as credenciais de acesso gravadas no banco' 
                  : 'Cadastre um novo login e senha com persistência no banco'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Nome Completo */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Nome do Usuário / Profissional <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Dra. Kaline ou Recepção Central"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#aa907d] pl-9"
                required
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* Login / Usuário */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Usuário de Login (E-mail ou Apelido) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: admin ou drakaline"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#aa907d] pl-9 font-mono"
                required
              />
              <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Este é o identificador que você usará na tela de Login. Apenas letras minúsculas e números sem espaços.
            </p>
          </div>

          {/* Cargo / Papel */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Perfil de Acesso
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#aa907d]"
            >
              <option value="Administrador">Administrador (Acesso Total ao Sistema e Banco)</option>
              <option value="Médica">Dra. Kaline (Acesso Clínico, Procedimentos e Clientes)</option>
              <option value="Recepção">Recepção / Atendimento (Agendamentos e Clientes)</option>
            </select>
          </div>

          {/* Senha */}
          <div className="pt-2 border-t border-stone-100">
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {isEditing ? 'Alterar Senha' : 'Senha de Acesso'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={isEditing ? 'Digite a nova senha' : 'Mínimo de 4 dígitos'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#aa907d] pl-9 pr-10"
                required={!isEditing}
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer p-0.5"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Confirmar Senha <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repita a senha digitada acima"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#aa907d] pl-9 pr-10"
                required={!isEditing || Boolean(password)}
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer p-0.5"
                title={showConfirmPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Database persistence note */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-amber-900 text-[11px] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Persistência direta no Banco de Dados:</span>
              <p className="text-amber-800/90 mt-0.5">
                Ao clicar em salvar, este usuário e senha serão gravados imediatamente na tabela <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-[10px]">admin_users</code> do seu banco de dados MySQL e sincronizados para acesso local.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>{isSaving ? 'Salvando no Banco...' : isEditing ? 'Gravar Alterações no Banco' : 'Adicionar Usuário ao Banco'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
