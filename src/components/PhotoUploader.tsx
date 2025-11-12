'use client';
import { useState, useEffect } from 'react';

interface PhotoUploaderProps {
  photos?: any[];
  setPhotos?: (photos: any[]) => void;
}

export default function PhotoUploader({ photos: externalPhotos, setPhotos: externalSetPhotos }: PhotoUploaderProps = {}) {
  const [localPhotos, setLocalPhotos] = useState<any[]>([]);
  const [dragging, setDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [lang, setLang] = useState('en');

  // Use external state if provided, otherwise use local state
  const photos = externalPhotos !== undefined ? externalPhotos : localPhotos;
  const setPhotos = externalSetPhotos || setLocalPhotos;

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') || 'en';
    setLang(savedLang);

    const handleLangChange = () => {
      const newLang = localStorage.getItem('lang') || 'en';
      setLang(newLang);
    };

    window.addEventListener('languageChange', handleLangChange);
    return () => window.removeEventListener('languageChange', handleLangChange);
  }, []);

  const translations = {
    en: {
      uploadedPhotos: 'Uploaded Photos',
      dragToReorder: 'Drag photos to reorder',
      clickToUpload: 'Click to upload or drag & drop',
      fileFormat: 'JPG or PNG, max 5MB per photo',
      remove: 'Remove',
    },
    et: {
      uploadedPhotos: 'Üles laaditud fotod',
      dragToReorder: 'Lohista fotosid ümber järjestamiseks',
      clickToUpload: 'Klõpsa üleslaadimiseks või lohista',
      fileFormat: 'JPG või PNG, max 5MB foto kohta',
      remove: 'Eemalda',
    },
    ru: {
      uploadedPhotos: 'Загруженные фото',
      dragToReorder: 'Перетащите фото для изменения порядка',
      clickToUpload: 'Нажмите для загрузки или перетащите',
      fileFormat: 'JPG или PNG, макс 5МБ на фото',
      remove: 'Удалить',
    },
    lv: {
      uploadedPhotos: 'Augšupielādētie fotoattēli',
      dragToReorder: 'Velciet fotoattēlus, lai pārkārtotu',
      clickToUpload: 'Noklikšķiniet, lai augšupielādētu, vai velciet',
      fileFormat: 'JPG vai PNG, maks. 5MB vienam foto',
      remove: 'Noņemt',
    },
    lt: {
      uploadedPhotos: 'Įkeltos nuotraukos',
      dragToReorder: 'Vilkite nuotraukas, kad pakeistumėte eilės tvarką',
      clickToUpload: 'Spustelėkite įkėlimui arba vilkite',
      fileFormat: 'JPG arba PNG, maks. 5MB vienai nuotraukai',
      remove: 'Pašalinti',
    },
  };

  const t = (key: string) => (translations as any)[lang as keyof typeof translations][key as any] || key;

  const handleFiles = (files: FileList) => {
    const newPhotos = Array.from(files).map((file) => ({
      id: Math.random().toString(36),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
    }));
    setPhotos([...photos, ...newPhotos]);
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos];
    const [moved] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, moved);
    setPhotos(newPhotos);
  };

  return (
    <div>
      <div
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          id="photo-input"
        />
        <label htmlFor="photo-input" className="cursor-pointer">
          <div className="text-6xl mb-4"></div>
          <div className="text-gray-600 dark:text-gray-300 mb-2">{t('clickToUpload')}</div>
          <div className="text-sm text-gray-500">{t('fileFormat')}</div>
        </label>
      </div>

      {photos.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">{t('uploadedPhotos')} ({photos.length})</h4>
            <span className="text-sm text-gray-500">{t('dragToReorder')}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                draggable
                onDragStart={(e) => {
                  setDraggedIndex(index);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedIndex !== null && draggedIndex !== index) {
                    movePhoto(draggedIndex, index);
                  }
                  setDraggedIndex(null);
                }}
                onDragEnd={() => setDraggedIndex(null)}
                className={`relative group border-2 rounded-lg overflow-hidden cursor-move transition-all ${
                  draggedIndex === index ? 'opacity-50 scale-95' : 'hover:border-blue-500'
                }`}
              >
                <img src={photo.preview} alt={photo.name} className="w-full h-40 object-cover" />
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                  #{index + 1}
                </div>
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                  title={t('remove')}
                >
                  ×
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="truncate">{photo.name}</div>
                  <div>{photo.size} MB</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}