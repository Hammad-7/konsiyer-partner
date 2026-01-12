import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-center gap-6">
          <Link 
            to="/privacy" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Gizlilik Politikası
          </Link>
          <Link 
            to="/terms" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Kullanıcı Sözleşmesi
          </Link>
        </div>
      </div>
    </footer>
  );
}
