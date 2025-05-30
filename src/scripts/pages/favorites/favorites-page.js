import IdbHelper from '../../utils/indexeddb';

const FavoritesPage = {
  render() {
    return `
      <main id="main-content" class="favorite-page" tabindex="-1" role="main" aria-label="Favorite stories">
        <h2>Story Favorit</h2>
        <div id="favorite-list" class="story-list" aria-live="polite" aria-busy="false"></div>
      </main>
    `;
  },

  async afterRender() {
    const container = document.querySelector('#favorite-list');

    if (!container) {
      console.error('Elemen kontainer favorit tidak ditemukan.');
      return;
    }

    container.setAttribute('aria-busy', 'true');
    container.innerHTML = '<p class="loading">Memuat cerita favorit...</p>';

    try {
      const favorites = await IdbHelper.getFavoriteStories();

      container.innerHTML = '';

      if (!favorites.length) {
        container.innerHTML = '<p>Belum ada cerita yang difavoritkan.</p>';
        container.setAttribute('aria-busy', 'false');
        return;
      }

      favorites.forEach((story) => {
        const article = document.createElement('article');
        article.classList.add('story-item');
        article.setAttribute('tabindex', '0');
        article.setAttribute('aria-label', `Story dari ${story.name || 'Tanpa Nama'}`);

        article.innerHTML = `
          <img src="${story.photoUrl || 'default-photo.png'}" alt="Foto dari ${story.name || 'Tanpa Nama'}" class="story-img" loading="lazy" />
          <h3 class="story-title">${story.name || 'Tanpa Nama'}</h3>
          <p class="story-description">${story.description || ''}</p>
          <time datetime="${story.createdAt}" class="story-date">${new Date(story.createdAt).toLocaleString()}</time>
          <a href="#/story/${story.id}" class="story-details-link" aria-label="Lihat detail cerita ${story.name}">Lihat Detail</a>
          <button class="unfavorite-btn" data-id="${story.id}" aria-label="Hapus cerita dari favorit">🗑️ Hapus dari Favorit</button>
        `;

        container.appendChild(article);
      });

      container.setAttribute('aria-busy', 'false');

      // Tambah event listener hapus favorit
      const unfavButtons = container.querySelectorAll('.unfavorite-btn');
      unfavButtons.forEach((btn) => {
        btn.addEventListener('click', async (event) => {
          const id = event.target.dataset.id;
          if (confirm('Yakin ingin menghapus dari favorit?')) {
            try {
              await IdbHelper.deleteFavorite(id);
              alert('Story dihapus dari favorit.');
              await FavoritesPage.afterRender(); // Refresh ulang halaman favorit
            } catch (err) {
              console.error('Gagal menghapus story:', err);
              alert('Gagal menghapus story dari favorit.');
            }
          }
        });
      });

    } catch (error) {
      console.error(error);
      container.innerHTML = '<p class="error-message">Gagal memuat cerita favorit.</p>';
      container.setAttribute('aria-busy', 'false');
    }
  }
};

export default FavoritesPage;
