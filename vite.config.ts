import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          missingPersons: path.resolve(__dirname, 'missing-persons.html'),
          searchPhoto: path.resolve(__dirname, 'search-photo.html'),
          rescue: path.resolve(__dirname, 'rescue.html'),
          relief: path.resolve(__dirname, 'relief.html'),
          map: path.resolve(__dirname, 'map.html'),
          news: path.resolve(__dirname, 'news.html'),
          reportMissing: path.resolve(__dirname, 'report-missing.html'),
          reportFound: path.resolve(__dirname, 'report-found.html'),
          familyReunion: path.resolve(__dirname, 'family-reunion.html'),
          emergency: path.resolve(__dirname, 'emergency.html'),
          about: path.resolve(__dirname, 'about.html'),
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
