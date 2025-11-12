'use client';
import { useState, useEffect } from 'react';
import { useLayout } from '@/contexts/LayoutContext';

const translations = {
  en: {
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    accentColor: 'Accent Color',
    light: 'Light',
    dark: 'Dark',
    close: 'Close',
    editLayout: 'Edit Layout',
    resetLayout: 'Reset Layout',
    home: 'Home',
    catalog: 'Catalog',
    sell: 'Sell',
    login: 'Login',
    profile: 'Profile',
    findYourBike: 'Find Your Perfect Bike',
    buySell: 'Buy and sell bikes, components, and parts in Estonia',
    search: 'Search',
    searchPlaceholder: 'Search for bikes, brands, models...',
    browseCategory: 'Browse by Category',
    all: 'All',
    roadBikes: 'Road Bikes',
    mountain: 'Mountain',
    gravel: 'Gravel',
    components: 'Components',
    parts: 'Parts',
    popularBrands: 'Popular Brands',
    latestListings: 'Latest Listings',
    viewAll: 'View all',
    howItWorks: 'How It Works',
    searchStep: '1. Search',
    connectStep: '2. Connect',
    buyStep: '3. Buy',
    filters: 'Filters',
    brand: 'Brand',
    allBrands: 'All Brands',
    priceRange: 'Price Range',
    clear: 'Clear',
    listings: 'listings',
    bicyclesForSale: 'Bicycles for Sale',
    backToHome: 'Back to Home',
    basicInfo: 'Basic Information',
    details: 'Details',
    photos: 'Photos',
    photoRequirements: 'Photo Requirements',
    uploadedPhotos: 'Uploaded Photos',
    dragToReorder: 'Drag photos to reorder',
    clickToUpload: 'Click to upload or drag & drop',
    fileFormat: 'JPG or PNG, max 5MB per photo',
    minimum6Photos: 'Minimum 6 photos required',
    fullBikeLeft: 'Full bike - left side (drivetrain)',
    fullBikeRight: 'Full bike - right side',
    selectBrand: 'Select brand...',
    selectYear: 'Select year...',
    year: 'Year',
    price: 'Price',
    priceEuro: 'Price (€)',
    description: 'Description',
    describeBike: 'Describe the bike...',
    next: 'Next',
    back: 'Back',
    publish: 'Publish',
    logout: 'Logout',
    accountType: 'Account Type',
    memberSince: 'Member since',
    personalInfo: 'Personal Info',
    myListings: 'My Listings',
    favorites: 'Favorites',
    messages: 'Messages',
    personalInformation: 'Personal Information',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    notProvided: 'Not provided',
    editProfile: 'Edit Profile',
    createNewListing: 'Create New Listing',
    noListingsYet: "You don't have any listings yet",
    favoritedListings: 'Favorited Listings',
    noFavoritesYet: "You haven't favorited any listings yet",
    noMessages: 'No messages yet',
    profileUpdatedSuccessfully: 'Profile updated successfully!',
    failedToUpdateProfile: 'Failed to update profile',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    hero_title: 'Find Your Perfect Bike',
    hero_subtitle: 'Buy and sell bikes, components, and parts in Estonia',
    search_placeholder: 'Search for bikes, brands, models...',
    browse_categories: 'Browse by Category',
    popular_brands: 'Popular Brands',
    latest_listings: 'Latest Listings',
    view_all: 'View all',
    how_it_works: 'How It Works',
    search_desc: 'Find the perfect bike using our advanced filters',
    connect: 'Connect',
    connect_desc: 'Message the seller and arrange a viewing',
    buy: 'Buy',
    buy_desc: 'Complete the transaction safely and ride away!',
    for_buyers: 'For Buyers',
    browse_bikes: 'Browse Bikes',
    how_to_buy: 'How to Buy',
    safety_tips: 'Safety Tips',
    for_sellers: 'For Sellers',
    create_listing: 'Create Listing',
    pricing: 'Pricing',
    business_accounts: 'Business Accounts',
    support: 'Support',
    faq: 'FAQ',
    contact_us: 'Contact Us',
    terms_of_service: 'Terms of Service',
  },
  et: {
    settings: 'Seaded',
    language: 'Keel',
    theme: 'Teema',
    accentColor: 'Rõhuvärv',
    light: 'Hele',
    dark: 'Tume',
    close: 'Sulge',
    editLayout: 'Muuda paigutust',
    resetLayout: 'Lähtesta paigutus',
    home: 'Avaleht',
    catalog: 'Kataloog',
    sell: 'Müü',
    login: 'Logi sisse',
    profile: 'Profiil',
    findYourBike: 'Leia oma ideaalne jalgratas',
    buySell: 'Osta ja müü jalgrattaid, komponente ja varuosi Eestis',
    search: 'Otsi',
    searchPlaceholder: 'Otsi jalgrattaid, kaubamarke, mudeleid...',
    browseCategory: 'Sirvi kategooriate kaupa',
    all: 'Kõik',
    roadBikes: 'Maanteejalgratad',
    mountain: 'Mägijalgrattad',
    gravel: 'Kruusjalgratad',
    components: 'Komponendid',
    parts: 'Varuosad',
    popularBrands: 'Populaarsed kaubamärgid',
    latestListings: 'Viimased kuulutused',
    viewAll: 'Vaata kõiki',
    howItWorks: 'Kuidas see töötab',
    searchStep: '1. Otsi',
    connectStep: '2. Võta ühendust',
    buyStep: '3. Osta',
    filters: 'Filtrid',
    brand: 'Bränd',
    allBrands: 'Kõik brändid',
    priceRange: 'Hinnavahemik',
    clear: 'Tühista',
    listings: 'kuulutust',
    bicyclesForSale: 'Jalgratad müügiks',
    backToHome: 'Tagasi avalehele',
    basicInfo: 'Põhiinfo',
    details: 'Üksikasjad',
    photos: 'Fotod',
    photoRequirements: 'Foto nõuded',
    uploadedPhotos: 'Üles laaditud fotod',
    dragToReorder: 'Lohista fotosid ümber järjestamiseks',
    clickToUpload: 'Klõpsa üleslaadimiseks või lohista',
    fileFormat: 'JPG või PNG, max 5MB foto kohta',
    minimum6Photos: 'Vähemalt 6 fotot nõutud',
    fullBikeLeft: 'Terve jalgratas - vasak külg (käigumehhanism)',
    fullBikeRight: 'Terve jalgratas - parem külg',
    selectBrand: 'Vali bränd...',
    selectYear: 'Vali aasta...',
    year: 'Aasta',
    price: 'Hind',
    priceEuro: 'Hind (€)',
    description: 'Kirjeldus',
    describeBike: 'Kirjelda jalgrattast...',
    next: 'Edasi',
    back: 'Tagasi',
    publish: 'Avalda',
    logout: 'Välja logimine',
    accountType: 'Konto tüüp',
    memberSince: 'Liige alates',
    personalInfo: 'Isiklik teave',
    myListings: 'Minu kuulutused',
    favorites: 'Lemmikud',
    messages: 'Sõnumid',
    personalInformation: 'Isiklik teave',
    fullName: 'Täisnimi',
    email: 'E-post',
    phone: 'Telefon',
    notProvided: 'Pole antud',
    editProfile: 'Muuda profiili',
    createNewListing: 'Loo uus kuulutus',
    noListingsYet: 'Teil pole veel ühtegi kuulutust',
    favoritedListings: 'Märgitud kuulutused',
    noFavoritesYet: 'Te pole veel ühtegi kuulutust märginud',
    noMessages: 'Sõnumeid pole',
    profileUpdatedSuccessfully: 'Profiil uuendatud edukalt!',
    failedToUpdateProfile: 'Profiili uuendamine ebaõnnestus',
    saveChanges: 'Salvesta muudatused',
    cancel: 'Tühista',
    hero_title: 'Leia oma ideaalne jalgratas',
    hero_subtitle: 'Osta ja müü jalgrattaid, komponente ja varuosi Eestis',
    search_placeholder: 'Otsi jalgrattaid, kaubamarke, mudeleid...',
    browse_categories: 'Sirvi kategooriate kaupa',
    popular_brands: 'Populaarsed kaubamärgid',
    latest_listings: 'Viimased kuulutused',
    view_all: 'Vaata kõiki',
    how_it_works: 'Kuidas see töötab',
    search_desc: 'Leia ideaalne jalgratas meie täiustatud filtrite abil',
    connect: 'Võta ühendust',
    connect_desc: 'Saada müüjale sõnum ja kohtumise ajastamine',
    buy: 'Osta',
    buy_desc: 'Viige tehingu turvaliselt lõpule ja sõitke ära!',
    for_buyers: 'Ostjatele',
    browse_bikes: 'Sirvi jalgrattaid',
    how_to_buy: 'Kuidas osta',
    safety_tips: 'Ohutusvihjed',
    for_sellers: 'Müüjatele',
    create_listing: 'Loo kuulutus',
    pricing: 'Hindamine',
    business_accounts: 'Ärikontod',
    support: 'Tugi',
    faq: 'KKK',
    contact_us: 'Võta meiega ühendust',
    terms_of_service: 'Kasutustingimused',
  },
  ru: {
    settings: 'Настройки',
    language: 'Язык',
    theme: 'Тема',
    accentColor: 'Цвет акцента',
    light: 'Светлая',
    dark: 'Тёмная',
    close: 'Закрыть',
    editLayout: 'Редактировать макет',
    resetLayout: 'Сбросить макет',
    home: 'Главная',
    catalog: 'Каталог',
    sell: 'Продать',
    login: 'Войти',
    profile: 'Профиль',
    findYourBike: 'Найдите свой идеальный велосипед',
    buySell: 'Покупайте и продавайте велосипеды, комплектующие и запчасти в Эстонии',
    search: 'Искать',
    searchPlaceholder: 'Поиск велосипедов, брендов, моделей...',
    browseCategory: 'Просмотр по категориям',
    all: 'Все',
    roadBikes: 'Шоссейные',
    mountain: 'Горные',
    gravel: 'Гравийные',
    components: 'Компоненты',
    parts: 'Запчасти',
    popularBrands: 'Популярные бренды',
    latestListings: 'Последние объявления',
    viewAll: 'Смотреть все',
    howItWorks: 'Как это работает',
    searchStep: '1. Ищите',
    connectStep: '2. Связывайтесь',
    buyStep: '3. Покупайте',
    filters: 'Фильтры',
    brand: 'Бренд',
    allBrands: 'Все бренды',
    priceRange: 'Диапазон цен',
    clear: 'Очистить',
    listings: 'объявлений',
    bicyclesForSale: 'Велосипеды на продажу',
    backToHome: 'Вернуться на главную',
    basicInfo: 'Основная информация',
    details: 'Детали',
    photos: 'Фото',
    photoRequirements: 'Требования к фото',
    uploadedPhotos: 'Загруженные фото',
    dragToReorder: 'Перетащите фото для изменения порядка',
    clickToUpload: 'Нажмите для загрузки или перетащите',
    fileFormat: 'JPG или PNG, макс 5МБ на фото',
    minimum6Photos: 'Минимум 6 фото обязательно',
    fullBikeLeft: 'Полный велосипед - левая сторона (трансмиссия)',
    fullBikeRight: 'Полный велосипед - правая сторона',
    selectBrand: 'Выберите бренд...',
    selectYear: 'Выберите год...',
    year: 'Год',
    price: 'Цена',
    priceEuro: 'Цена (€)',
    description: 'Описание',
    describeBike: 'Опишите велосипед...',
    next: 'Далее',
    back: 'Назад',
    publish: 'Опубликовать',
    logout: 'Выход',
    accountType: 'Тип аккаунта',
    memberSince: 'Участник с',
    personalInfo: 'Личная информация',
    myListings: 'Мои объявления',
    favorites: 'Избранное',
    messages: 'Сообщения',
    personalInformation: 'Личная информация',
    fullName: 'Полное имя',
    email: 'Email',
    phone: 'Телефон',
    notProvided: 'Не предоставлено',
    editProfile: 'Редактировать профиль',
    createNewListing: 'Создать объявление',
    noListingsYet: 'У вас пока нет объявлений',
    favoritedListings: 'Избранные объявления',
    noFavoritesYet: 'Вы ещё не добавили объявления в избранное',
    noMessages: 'Сообщений нет',
    profileUpdatedSuccessfully: 'Профиль успешно обновлён!',
    failedToUpdateProfile: 'Не удалось обновить профиль',
    saveChanges: 'Сохранить изменения',
    cancel: 'Отмена',
    hero_title: 'Найдите свой идеальный велосипед',
    hero_subtitle: 'Покупайте и продавайте велосипеды, комплектующие и запчасти в Эстонии',
    search_placeholder: 'Поиск велосипедов, брендов, моделей...',
    browse_categories: 'Просмотр по категориям',
    popular_brands: 'Популярные бренды',
    latest_listings: 'Последние объявления',
    view_all: 'Смотреть все',
    how_it_works: 'Как это работает',
    search_desc: 'Найдите идеальный велосипед с помощью наших расширенных фильтров',
    connect: 'Свяжитесь',
    connect_desc: 'Напишите продавцу и договоритесь о просмотре',
    buy: 'Купить',
    buy_desc: 'Завершите сделку безопасно и уезжайте!',
    for_buyers: 'Для покупателей',
    browse_bikes: 'Просмотр велосипедов',
    how_to_buy: 'Как купить',
    safety_tips: 'Советы по безопасности',
    for_sellers: 'Для продавцов',
    create_listing: 'Создать объявление',
    pricing: 'Цена',
    business_accounts: 'Бизнес-аккаунты',
    support: 'Поддержка',
    faq: 'Часто задаваемые вопросы',
    contact_us: 'Свяжитесь с нами',
    terms_of_service: 'Условия использования',
  },
  lt: {
    settings: 'Nustatymai',
    language: 'Kalba',
    theme: 'Tema',
    accentColor: 'Akcentavimo spalva',
    light: 'Šviesi',
    dark: 'Tamsi',
    close: 'Uždaryti',
    editLayout: 'Redaguoti išdėstymą',
    resetLayout: 'Atstatyti išdėstymą',
    home: 'Pradžia',
    catalog: 'Katalogas',
    sell: 'Parduoti',
    login: 'Prisijungti',
    profile: 'Profilis',
    findYourBike: 'Raskite savo idealų dviratį',
    buySell: 'Pirkite ir parduokite dviračius, komponentus ir dalis Estijoje',
    search: 'Paieška',
    searchPlaceholder: 'Ieškoti dviračių, prekės ženklų, modelių...',
    browseCategory: 'Naršyti pagal kategoriją',
    all: 'Visi',
    roadBikes: 'Kelių dviračiai',
    mountain: 'Kalnų dviračiai',
    gravel: 'Žvyro dviračiai',
    components: 'Komponentai',
    parts: 'Dalys',
    popularBrands: 'Populiarios markos',
    latestListings: 'Naujausi skelbimi',
    viewAll: 'Peržiūrėti visus',
    howItWorks: 'Kaip tai veikia',
    searchStep: '1. Ieškok',
    connectStep: '2. Susisiek',
    buyStep: '3. Pirkk',
    filters: 'Filtrai',
    brand: 'Prekės ženklas',
    allBrands: 'Visos markos',
    priceRange: 'Kainų diapazonas',
    clear: 'Išvalyti',
    listings: 'skelbimų',
    bicyclesForSale: 'Dviračiai parduodami',
    backToHome: 'Grįžti į pradžią',
    basicInfo: 'Pagrindinė informacija',
    details: 'Išsamiau',
    photos: 'Nuotraukos',
    photoRequirements: 'Nuotraukų reikalavimai',
    uploadedPhotos: 'Įkeltos nuotraukos',
    dragToReorder: 'Vilkite nuotraukas, kad iš naujo sutvarkyti',
    clickToUpload: 'Spustelėkite norėdami įkelti arba vilkite',
    fileFormat: 'JPG arba PNG, maks. 5MB per nuotrauką',
    minimum6Photos: 'Reikalingos mažiausiai 6 nuotraukos',
    fullBikeLeft: 'Visas dviratis - kairinė pusė (transmisija)',
    fullBikeRight: 'Visas dviratis - dešinė pusė',
    selectBrand: 'Pasirinkite markę...',
    selectYear: 'Pasirinkite metus...',
    year: 'Metai',
    price: 'Kaina',
    priceEuro: 'Kaina (€)',
    description: 'Aprašymas',
    describeBike: 'Aprašykite dviratį...',
    next: 'Toliau',
    back: 'Atgal',
    publish: 'Publikuoti',
    logout: 'Atsijungti',
    accountType: 'Paskyros tipas',
    memberSince: 'Narys nuo',
    personalInfo: 'Asmeninė informacija',
    myListings: 'Mano skelbimi',
    favorites: 'Mėgiamiausi',
    messages: 'Žinutės',
    personalInformation: 'Asmeninė informacija',
    fullName: 'Pilnas vardas',
    email: 'El. paštas',
    phone: 'Telefonas',
    notProvided: 'Nepateikta',
    editProfile: 'Redaguoti profilį',
    createNewListing: 'Sukurti naują skelbimą',
    noListingsYet: 'Dar neturite jokių skelbimų',
    favoritedListings: 'Mėgiami skelbimi',
    noFavoritesYet: 'Dar nepažymėjote jokių skelbimų',
    noMessages: 'Nėra žinučių',
    profileUpdatedSuccessfully: 'Profilis sėkmingai atnaujintas!',
    failedToUpdateProfile: 'Nepavyko atnaujinti profilio',
    saveChanges: 'Išsaugoti pakeitimus',
    cancel: 'Atšaukti',
    hero_title: 'Raskite savo idealų dviratį',
    hero_subtitle: 'Pirkite ir parduokite dviračius, komponentus ir dalis Estijoje',
    search_placeholder: 'Ieškoti dviračių, prekės ženklų, modelių...',
    browse_categories: 'Naršyti pagal kategoriją',
    popular_brands: 'Populiarios markos',
    latest_listings: 'Naujausi skelbimi',
    view_all: 'Peržiūrėti visus',
    how_it_works: 'Kaip tai veikia',
    search_desc: 'Raskite idealų dviratį naudodami mūsų pažangius filtrus',
    connect: 'Susisiekti',
    connect_desc: 'Parašykite pardavėjui žinutę ir susitarkite dėl peržiūros',
    buy: 'Pirkti',
    buy_desc: 'Saugiai užbaikite sandorį ir išvažiuokite!',
    for_buyers: 'Pirkėjams',
    browse_bikes: 'Naršyti dviračius',
    how_to_buy: 'Kaip pirkti',
    safety_tips: 'Saugumo patarimai',
    for_sellers: 'Pardavėjams',
    create_listing: 'Kurti skelbimą',
    pricing: 'Kainodara',
    business_accounts: 'Verslo sąskaitos',
    support: 'Pagalba',
    faq: 'DUK',
    contact_us: 'Susisiekite su mumis',
    terms_of_service: 'Paslaugos sąlygos',
  },
  lv: {
    settings: 'Iestatījumi',
    language: 'Valoda',
    theme: 'Tēma',
    accentColor: 'Uzsvara krāsa',
    light: 'Gaišš',
    dark: 'Tumšš',
    close: 'Aizvērt',
    editLayout: 'Rediģēt izkārtojumu',
    resetLayout: 'Atiestatīt izkārtojumu',
    home: 'Sākums',
    catalog: 'Katalogs',
    sell: 'Pārdot',
    login: 'Pierakstīties',
    profile: 'Profils',
    findYourBike: 'Atrodiet savu ideālo velosipēdu',
    buySell: 'Pirkt un pārdot velosipēdus, komponentus un detaļas Igaunijā',
    search: 'Meklēt',
    searchPlaceholder: 'Meklēt velosipēdus, zīmolus, modeļus...',
    browseCategory: 'Pārlūkot pēc kategorijas',
    all: 'Visi',
    roadBikes: 'Šosejas velosipēdi',
    mountain: 'Kalnu velosipēdi',
    gravel: 'Grants velosipēdi',
    components: 'Komponenti',
    parts: 'Daļas',
    popularBrands: 'Populāras markas',
    latestListings: 'Jaunākie sludinājumi',
    viewAll: 'Skatīt visus',
    howItWorks: 'Kā tas darbojas',
    searchStep: '1. Meklējiet',
    connectStep: '2. Sazinieties',
    buyStep: '3. Pērkiet',
    filters: 'Filtri',
    brand: 'Marka',
    allBrands: 'Visas markas',
    priceRange: 'Cenas diapazons',
    clear: 'Notīrīt',
    listings: 'sludinājumi',
    bicyclesForSale: 'Velosipēdi pārdošanai',
    backToHome: 'Atgriezties uz sākumu',
    basicInfo: 'Pamatinformācija',
    details: 'Detaļas',
    photos: 'Fotogrāfijas',
    photoRequirements: 'Fotogrāfiju prasības',
    uploadedPhotos: 'Augšupielādētās fotogrāfijas',
    dragToReorder: 'Velciet fotogrāfijas, lai pārkārtotu',
    clickToUpload: 'Noklikšķiniet, lai augšupielādētu, vai velciet',
    fileFormat: 'JPG vai PNG, maks. 5MB uz fotogrāfiju',
    minimum6Photos: 'Minimums 6 fotogrāfijas ir obligātas',
    fullBikeLeft: 'Pilns velosipēds - kreisā puse (transmisija)',
    fullBikeRight: 'Pilns velosipēds - labā puse',
    selectBrand: 'Atlasiet marku...',
    selectYear: 'Atlasiet gadu...',
    year: 'Gads',
    price: 'Cena',
    priceEuro: 'Cena (€)',
    description: 'Apraksts',
    describeBike: 'Aprakstiet velosipēdu...',
    next: 'Tālāk',
    back: 'Atpakaļ',
    publish: 'Publicēt',
    logout: 'Izrakstīties',
    accountType: 'Konta veids',
    memberSince: 'Biedrs kopš',
    personalInfo: 'Personīgā informācija',
    myListings: 'Mani sludinājumi',
    favorites: 'Favorīti',
    messages: 'Ziņojumi',
    personalInformation: 'Personīgā informācija',
    fullName: 'Pilnais vārds',
    email: 'E-pasts',
    phone: 'Tālrunis',
    notProvided: 'Nav norādīts',
    editProfile: 'Rediģēt profilu',
    createNewListing: 'Izveidot jaunu sludinājumu',
    noListingsYet: 'Vēl nav neviena sludinājuma',
    favoritedListings: 'Iecienītie sludinājumi',
    noFavoritesYet: 'Vēl neesi atzīmējis nevienu sludinājumu',
    noMessages: 'Nav ziņojumu',
    profileUpdatedSuccessfully: 'Profils veiksmīgi atjaunināts!',
    failedToUpdateProfile: 'Neizdevās atjaunināt profilu',
    saveChanges: 'Saglabāt izmaiņas',
    cancel: 'Atcelt',
    hero_title: 'Atrodiet savu ideālo velosipēdu',
    hero_subtitle: 'Pirkt un pārdot velosipēdus, komponentus un detaļas Igaunijā',
    search_placeholder: 'Meklēt velosipēdus, zīmolus, modeļus...',
    browse_categories: 'Pārlūkot pēc kategorijas',
    popular_brands: 'Populāras markas',
    latest_listings: 'Jaunākie sludinājumi',
    view_all: 'Skatīt visus',
    how_it_works: 'Kā tas darbojas',
    search_desc: 'Atrodiet ideālo velosipēdu, izmantojot mūsu paplašinātos filtrus',
    connect: 'Sazinieties',
    connect_desc: 'Rakstiet pārdevējam un vienoties par apskati',
    buy: 'Pirkums',
    buy_desc: 'Droši pabeigiet darījumu un aizstumiet!',
    for_buyers: 'Pircējiem',
    browse_bikes: 'Pārlūkot velosipēdus',
    how_to_buy: 'Kā pirkt',
    safety_tips: 'Drošības padomi',
    for_sellers: 'Pārdevējiem',
    create_listing: 'Izveidot sludinājumu',
    pricing: 'Cenu noteikšana',
    business_accounts: 'Biznesa konti',
    support: 'Atbalsts',
    faq: 'BUJ',
    contact_us: 'Sazinieties ar mums',
    terms_of_service: 'Pakalpojuma noteikumi',
  },
};

export default function Settings() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('light');
  const [color, setColor] = useState('blue');
  const { editMode, toggleEditMode, resetLayout } = useLayout();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('lang') || 'en';
      const savedTheme = localStorage.getItem('theme') || 'light';
      const savedColor = localStorage.getItem('color') || 'blue';
      setLang(savedLang);
      setTheme(savedTheme);
      setColor(savedColor);
      document.documentElement.className = `theme-${savedTheme} color-${color}`;
      document.documentElement.setAttribute('data-lang', savedLang);
    }
  }, []);

  const t = (key: string) => (translations as any)[lang as keyof typeof translations][key as any] || key;

  const changeLang = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    document.documentElement.setAttribute('data-lang', newLang);
    window.dispatchEvent(new Event('languageChange'));
    setOpen(false);
  };

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = `theme-${newTheme} color-${color}`;
  };

  const changeColor = (newColor: string) => {
    setColor(newColor);
    localStorage.setItem('color', newColor);
    document.documentElement.className = `theme-${theme} color-${newColor}`;
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-bold border-2 border-gray-300 hover:border-blue-500"
        title={t('settings')}
      >
        
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 dark:text-white">{t('settings')}</h3>

            <div className="mb-6">
              <label className="block font-medium mb-2 dark:text-gray-200">{t('language')}</label>
              <div className="grid grid-cols-5 gap-2">
                {['en', 'et', 'ru', 'lt', 'lv'].map((l) => (
                  <button
                    key={l}
                    onClick={() => changeLang(l)}
                    className={`px-2 py-2 rounded-lg border-2 font-bold transition-all text-sm ${
                      lang === l
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:text-gray-200'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-2 dark:text-gray-200">{t('theme')}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => changeTheme('light')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    theme === 'light' 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:text-gray-200'
                  }`}
                >
                  {t('light')}
                </button>
                <button
                  onClick={() => changeTheme('dark')}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    theme === 'dark' 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:text-gray-200'
                  }`}
                >
                  {t('dark')}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-2 dark:text-gray-200">{t('accentColor')}</label>
              <div className="grid grid-cols-4 gap-2">
                <button onClick={() => changeColor('blue')} className={`h-10 rounded-lg bg-blue-600 transition-all ${color === 'blue' ? 'ring-4 ring-blue-300' : ''}`} title="Blue" />
                <button onClick={() => changeColor('green')} className={`h-10 rounded-lg bg-green-600 transition-all ${color === 'green' ? 'ring-4 ring-green-300' : ''}`} title="Green" />
                <button onClick={() => changeColor('red')} className={`h-10 rounded-lg bg-red-600 transition-all ${color === 'red' ? 'ring-4 ring-red-300' : ''}`} title="Red" />
                <button onClick={() => changeColor('purple')} className={`h-10 rounded-lg bg-purple-600 transition-all ${color === 'purple' ? 'ring-4 ring-purple-300' : ''}`} title="Purple" />
              </div>
            </div>

            <div className="mb-6 border-t pt-6 dark:border-gray-600">
              <label className="block font-medium mb-3 dark:text-gray-200"> Layout</label>
              <button
                onClick={() => { toggleEditMode(); setOpen(false); }}
                className={`w-full px-4 py-3 rounded-lg font-medium mb-2 transition-all ${
                  editMode 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {editMode ? ' ' : ' '}{t('editLayout')}
              </button>
              <button
                onClick={resetLayout}
                className="w-full px-4 py-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 font-medium"
              >
                 {t('resetLayout')}
              </button>
            </div>

            <button onClick={() => setOpen(false)} className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium">
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export { translations };