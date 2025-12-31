export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white text-sm text-gray-500">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 py-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <p>© {new Date().getFullYear()} KesKonMange ?</p>

          <div className="flex flex-wrap gap-4">
            <a href="/shops" className="hover:underline">⏳ TMP STORE</a>
            
            <a href="#" className="hover:underline">Centre d’aide</a>
            <a href="/settings/termsofuse" className="hover:underline">Conditions d’utilisation</a>
            <a href="#" className="hover:underline">Confidentialité</a>
            <a href="#" className="hover:underline">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
