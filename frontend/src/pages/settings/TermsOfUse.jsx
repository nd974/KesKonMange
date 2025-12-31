export default function TermeOfUse() {

    const handlePrint = () => {
        window.print();
    };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de navigation en haut (masquée à l'impression) */}
      <div className="flex justify-between items-center px-6 md:px-12 lg:px-24 py-4 bg-white border-b print:hidden">
        <a href="/" className="flex items-center gap-2 text-l text-gray-600 mb-6 hover:underline">
          ← Retour sur KesKonMange
        </a>
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Imprimer
        </button>
      </div>
      <div className="flex flex-col lg:flex-row">
        <main className="flex-1 px-6 md:px-12 lg:px-24 py-10">
          <h1 className="text-3xl font-bold mb-10">Conditions d'utilisation de KesKonMange</h1>

          {/* 1. Objet */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">1. Objet</h2>
            <p className="text-gray-800 leading-relaxed mb-4">
              KesKonMange est une application permettant aux foyers de :
            </p>
            <ul className="text-gray-800 mb-4 space-y-1 list-none">
              <li>1.1. Gérer les stocks alimentaires de la maison.</li>
              <li>1.2. Créer des menus à partir des ingrédients disponibles.</li>
              <li>1.3. Générer automatiquement des listes de courses pour les ingrédients manquants.</li>
              <li>1.4. Proposer des recettes adaptées aux ingrédients déjà en stock, avec éventuellement un budget limité pour les ingrédients manquants.</li>
              <li>1.5. Collaborer entre différents profils d’utilisateurs au sein d’un même foyer.</li>
            </ul>
            <p className="text-gray-800 leading-relaxed">
              En utilisant KesKonMange, vous acceptez de respecter les règles décrites dans ces conditions.
            </p>
          </section>

          {/* 2. Inscription et comptes */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">2. Inscription et comptes</h2>
            <ul className="text-gray-800 space-y-1 list-none">
              <li>2.1. Chaque foyer peut créer un compte commun.</li>
              <li>2.2. Plusieurs profils utilisateurs peuvent être ajoutés au sein d’un même compte.</li>
              <li>2.3. Chaque utilisateur est responsable de la sécurité de ses informations de connexion.</li>
              <li>2.4. L’utilisateur s’engage à fournir des informations exactes et à jour lors de son inscription.</li>
            </ul>
          </section>

          {/* 3. Utilisation de l’application */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">3. Utilisation de l’application</h2>
            <ul className="text-gray-800 space-y-1 list-none">
              <li>3.1. L’utilisateur peut ajouter, modifier ou supprimer des ingrédients et des recettes dans son stock.</li>
              <li>3.2. L’application peut générer des menus et des listes de courses selon les ingrédients disponibles et les préférences définies.</li>
              <li>3.3. L’utilisateur peut fixer un budget pour les ingrédients manquants (par exemple, un bucket de 5 €) et KesKonMange proposera des alternatives adaptées.</li>
              <li>3.4. L’utilisateur s’engage à utiliser l’application conformément à la loi et à ne pas publier de contenus illégaux ou offensants.</li>
            </ul>
          </section>

          {/* 4. Propriété intellectuelle */}
          <section className="mb-10 print:pt-12">
            <h2 className="text-2xl font-semibold mb-4">4. Propriété intellectuelle</h2>
            <ul className="text-gray-800 space-y-1 list-none">
              <li>4.1. Tous les contenus, logos, designs et fonctionnalités de KesKonMange sont la propriété exclusive de l’application ou de ses partenaires.</li>
              <li>4.2. Les utilisateurs ne peuvent pas copier, reproduire, distribuer ou créer des œuvres dérivées sans autorisation écrite préalable.</li>
            </ul>
          </section>

          {/* 5. Données personnelles */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">5. Données personnelles</h2>
            <ul className="text-gray-800 space-y-1 list-none">
              <li>5.1. KesKonMange collecte des données personnelles pour permettre le fonctionnement de l’application (gestion des profils, stocks, menus, préférences).</li>
              <li>5.2. Les données sont utilisées uniquement pour améliorer l’expérience utilisateur et ne seront pas partagées avec des tiers sans consentement.</li>
              <li>5.3. L’utilisateur peut demander la modification ou la suppression de ses données personnelles à tout moment.</li>
            </ul>
          </section>

          {/* 6. Responsabilité */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">6. Responsabilité</h2>
            <ul className="text-gray-800 space-y-1 list-none">
              <li>6.1. KesKonMange fournit des suggestions de recettes et de menus à titre informatif. La qualité des repas et la sécurité alimentaire restent sous la responsabilité de l’utilisateur.</li>
              <li>6.2. L’application ne peut être tenue responsable de toute erreur dans la liste des ingrédients ou dans la planification des repas.</li>
              <li>6.3. KesKonMange décline toute responsabilité en cas de dommages liés à l’utilisation de l’application ou à des achats effectués en dehors de l’application.</li>
            </ul>
          </section>

          {/* 7. Modifications et suspension du service */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">7. Modifications et suspension du service</h2>
            <ul className="text-gray-800 space-y-1 list-none">
              <li>7.1. KesKonMange peut être mis à jour, modifié ou suspendu à tout moment sans préavis.</li>
              <li>7.2. L’utilisateur sera informé des changements majeurs via l’application ou par email.</li>
            </ul>
          </section>

          {/* 8. Résiliation */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">8. Résiliation</h2>
            <ul className="text-gray-800 space-y-1 list-none">
              <li>8.1. L’utilisateur peut supprimer son compte à tout moment.</li>
              <li>8.2. KesKonMange se réserve le droit de suspendre ou de supprimer un compte en cas de violation des présentes conditions.</li>
            </ul>
          </section>

          {/* 9. Loi applicable et juridiction */}
          <section className="mb-10 print:pt-12">
            <h2 className="text-2xl font-semibold mb-4">9. Loi applicable et juridiction</h2>
            <p className="text-gray-800 leading-relaxed">
              Les présentes conditions sont régies par la loi en vigueur dans le pays où KesKonMange est exploitée. Tout
              litige sera soumis aux tribunaux compétents.
            </p>
          </section>

          {/* 10. Contact */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">10. Contact</h2>
            <p className="text-gray-800 leading-relaxed">
              Pour toute question concernant ces conditions d’utilisation, vous pouvez nous contacter à :{" "}
              <a href="mailto:contact@keskonmange.com" className="text-blue-600 underline">
                contact@keskonmange.com
              </a>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
