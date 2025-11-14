import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const toastTypes = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-500/20 border-green-500/30 text-green-400'
  },
  error: {
    icon: AlertCircle,
    className: 'bg-red-500/20 border-red-500/30 text-red-400'
  },
  info: {
    icon: Info,
    className: 'bg-blue-500/20 border-blue-500/30 text-blue-400'
  },
  warning: {
    icon: AlertCircle,
    className: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
  }
};

export function Toast({ type = 'info', message, onClose, duration = 5000 }) {
  const [visible, setVisible] = React.useState(true);
  const config = toastTypes[type];
  const Icon = config.icon;

  React.useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`
      fixed bottom-6 right-6 z-50
      flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl
      transition-all duration-300
      ${config.className}
      ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
    `}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    window.showToast = (type, message, duration) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, type, message, duration }]);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}

export default Toast;