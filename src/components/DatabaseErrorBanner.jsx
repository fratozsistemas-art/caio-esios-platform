import { AlertCircle } from 'lucide-react';
import { base44Status } from '@/api/base44Client';

export default function DatabaseErrorBanner({ message = null }) {
  const errorMessage = message || base44Status.errorMessage;
  const missingEnv = base44Status.missingEnv || [];

  if (base44Status.ready) return null;

  return (
    <div className="mb-4 rounded-lg border border-red-500/50 bg-red-950/60 px-4 py-3 text-sm text-red-100 shadow-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-300" />
        <div className="space-y-1">
          <p className="font-semibold text-red-100">Database connection unavailable</p>
          <p className="text-red-100/90">
            {errorMessage || 'O cliente Base44 não conseguiu inicializar a camada de database.'}
          </p>
          {missingEnv.length > 0 && (
            <p className="text-red-100/80">Defina as variáveis: {missingEnv.join(', ')}.</p>
          )}
          <ul className="list-disc space-y-1 pl-4 text-red-100/80">
            <li>Confirme as variáveis de ambiente do SDK (APP_ID, URLs de API e database).</li>
            <li>Garanta que o banco remoto esteja acessível a partir deste ambiente.</li>
            <li>Recarregue após ajustar as credenciais ou tente novamente em modo offline.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}