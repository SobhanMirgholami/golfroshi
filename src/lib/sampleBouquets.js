// Sample bouquets: the shop starts with these in demo mode, and the Supabase seed uses the same data.
// Photos are illustrations made for this project (public/bouquets).
export const CATEGORIES = ['romantic', 'pastel', 'wild', 'seasonal', 'luxury']

export const sampleBouquets = [
  {
    id: 'sample-blush-morning',
    name: { tr: 'Pembe Sabah', en: 'Blush Morning', ar: 'صباح وردي' },
    description: {
      tr: 'Pudra pembesi şakayıklar, krem güller ve okaliptüs; aralarında gelin duvağı. Doğum günü ya da “iyi ki varsın” için.',
      en: 'Powder-pink peonies, cream roses and eucalyptus, with a cloud of baby’s breath. For birthdays or a simple “glad you exist”.',
      ar: 'فاوانيا بلون الورد الفاتح وورود كريمية وأوكالبتوس مع سحابة من زهرة أنفاس الطفل. لأعياد الميلاد أو لرسالة «سعيد بوجودك».',
    },
    price: 1450,
    category: 'pastel',
    isAvailable: true,
    image: '/bouquets/blush-morning.webp',
  },
  {
    id: 'sample-red-letter',
    name: { tr: 'Kırmızı Mektup', en: 'Red Letter', ar: 'رسالة حمراء' },
    description: {
      tr: 'Koyu kırmızı güller, yaban mersini dalları ve siyah kâğıt. Söylenmesi zor olanı söyler.',
      en: 'Deep red roses with dark berries, wrapped in black paper. Says the thing that’s hard to say.',
      ar: 'ورود حمراء داكنة مع توت داكن، ملفوفة بورق أسود. تقول ما يصعب قوله.',
    },
    price: 1850,
    category: 'romantic',
    isAvailable: true,
    image: '/bouquets/red-letter.webp',
  },
  {
    id: 'sample-meadow',
    name: { tr: 'Kır Çiçekleri', en: 'Meadow', ar: 'مرج' },
    description: {
      tr: 'Papatyalar, lavanta ve kır otları, kraft kâğıtta. Bahar sabahı bir tarladan toplanmış gibi.',
      en: 'Daisies, lavender and wild grasses in kraft paper, as if picked from a field on a spring morning.',
      ar: 'أقحوان ولافندر وأعشاب برية في ورق كرافت، كأنها قُطفت من حقل في صباح ربيعي.',
    },
    price: 950,
    category: 'wild',
    isAvailable: true,
    image: '/bouquets/meadow.webp',
  },
  {
    id: 'sample-tulip-season',
    name: { tr: 'Lale Mevsimi', en: 'Tulip Season', ar: 'موسم التوليب' },
    description: {
      tr: 'İstanbul’un çiçeğine selam: kırmızıdan açık pembeye laleler, uzun yeşil yapraklarıyla.',
      en: 'A nod to Istanbul’s own flower: tulips from red to the palest pink, with their long green leaves.',
      ar: 'تحية لزهرة إسطنبول: توليب من الأحمر إلى الوردي الباهت، مع أوراقها الخضراء الطويلة.',
    },
    price: 1200,
    category: 'seasonal',
    isAvailable: true,
    image: '/bouquets/tulip-season.webp',
  },
  {
    id: 'sample-ivory-hour',
    name: { tr: 'Fildişi Saat', en: 'Ivory Hour', ar: 'ساعة العاج' },
    description: {
      tr: 'Beyaz güller, düğün çiçekleri ve şakayıklar; okaliptüs ve eğrelti otuyla. Nikâh, nişan ve büyük günler için atölyenin imzası.',
      en: 'White roses, ranunculus and peonies with eucalyptus and fern. The atelier’s signature for weddings, engagements and big days.',
      ar: 'ورود بيضاء وحوذان وفاوانيا مع أوكالبتوس وسرخس. توقيع المشغل للأعراس والخطوبة والأيام الكبيرة.',
    },
    price: 2400,
    category: 'luxury',
    isAvailable: true,
    image: '/bouquets/ivory-hour.webp',
  },
  {
    id: 'sample-sunset',
    name: { tr: 'Gün Batımı', en: 'Sunset', ar: 'غروب' },
    description: {
      tr: 'Turuncu ve mercan düğün çiçekleri, sarı tomurcuklar ve koyu yeşil kâğıt. Akşam ışığı gibi sıcak.',
      en: 'Orange and coral ranunculus with yellow buds in dark green paper. Warm like evening light.',
      ar: 'حوذان برتقالي ومرجاني مع براعم صفراء في ورق أخضر داكن. دافئة كضوء المساء.',
    },
    price: 1350,
    category: 'seasonal',
    isAvailable: false,
    image: '/bouquets/sunset.webp',
  },
  {
    id: 'sample-lilac-note',
    name: { tr: 'Leylak Notası', en: 'Lilac Note', ar: 'نغمة الليلك' },
    description: {
      tr: 'Lila şakayıklar, lavanta dalları ve mor düğün çiçekleri. Sakin, zarif ve biraz da nostaljik.',
      en: 'Lilac peonies, lavender stems and purple ranunculus. Calm, elegant and a little nostalgic.',
      ar: 'فاوانيا ليلكية وأغصان لافندر وحوذان بنفسجي. هادئة وأنيقة وفيها شيء من الحنين.',
    },
    price: 1100,
    category: 'pastel',
    isAvailable: true,
    image: '/bouquets/lilac-note.webp',
  },
]
