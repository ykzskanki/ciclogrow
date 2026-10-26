import React, { useState, useEffect } from 'react';
import { X, Monitor, Download, ExternalLink, Check, Copy, Laptop, Terminal, Sparkles } from 'lucide-react';

interface InstallWindowsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallWindowsModal: React.FC<InstallWindowsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [copiedCmd, setCopiedCmd] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert(
        'Para instalar no Windows:\n\n1. No Google Chrome: clique no ícone de monitor/download no canto direito da barra de endereços (ou Menu ⋮ -> "Salvar e Compartilhar" -> "Instalar CicloGrow").\n\n2. No Microsoft Edge: clique no ícone de aplicativo na barra de endereços (ou Menu ... -> "Aplicativos" -> "Instalar CicloGrow").'
      );
    }
  };

  const currentUrl = window.location.href;
  const nativefierCommand = `npx @nativefier/nativefier --name "CicloGrow" "${currentUrl}" --single-instance`;

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(nativefierCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="px-5 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Instalar Versão para Computador (Windows)
              </h2>
              <p className="text-xs text-zinc-400">
                Execute o CicloGrow como um programa nativo na sua Área de Trabalho
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Method 1: Native Windows App (PWA) - Recommended */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-zinc-950 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Método 1: Instalação Direta no Windows (Mais Rápido & Recomendado)
                </span>
              </div>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                1 Clique
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Você pode instalar o CicloGrow diretamente no seu Windows via <strong>Microsoft Edge</strong> ou <strong>Google Chrome</strong>. Ele funciona exatamente como um aplicativo <code>.exe</code>: cria um ícone na sua <strong>Área de Trabalho</strong> e no <strong>Menu Iniciar</strong>, abre em janela própria sem abas e funciona com o calendário do seu sistema!
            </p>

            <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 text-xs space-y-2 text-zinc-300">
              <div className="font-semibold text-white">Como fazer no seu navegador agora:</div>
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li>
                  <strong className="text-zinc-200">No Microsoft Edge:</strong> Clique no ícone de <strong>Aplicativo (3 quadradinhos com +)</strong> na barra de endereços ou vá em <code>Menu (...) ➔ Aplicativos ➔ Instalar CicloGrow</code>.
                </li>
                <li>
                  <strong className="text-zinc-200">No Google Chrome:</strong> Clique no ícone de <strong>Computador com seta de download</strong> no canto direito da barra de endereços ou vá em <code>Menu (⋮) ➔ Salvar e compartilhar ➔ Instalar CicloGrow</code>.
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={handleInstallPwa}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Instalar Aplicativo no Windows Agora
            </button>
          </div>

          {/* Method 2: Generate .exe with Nativefier */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Método 2: Gerar Arquivo Executável .EXE com Nativefier / Electron
                </span>
              </div>
              <span className="text-[11px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                Desenvolvedor / .exe
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Se você deseja gerar uma pasta com um arquivo <strong>CicloGrow.exe</strong> independente no seu computador, você pode rodar o comando abaixo no seu <strong>Prompt de Comando (CMD)</strong> ou <strong>PowerShell</strong> do Windows (com Node.js instalado):
            </p>

            <div className="relative">
              <pre className="bg-black/90 p-3 rounded-lg border border-zinc-800 text-[11px] font-mono text-emerald-400 overflow-x-auto pr-16 select-all">
                {nativefierCommand}
              </pre>
              <button
                type="button"
                onClick={handleCopyCommand}
                aria-label="Copiar comando"
                className="absolute right-2 top-2 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] flex items-center gap-1 font-medium transition-colors"
              >
                {copiedCmd ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar
                  </>
                )}
              </button>
            </div>

            <div className="text-[11px] text-zinc-500">
              Isso criará uma pasta com o executável <code>CicloGrow.exe</code> pronto para usar sem precisar abrir navegadores.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-zinc-950 bg-white hover:bg-zinc-200 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
