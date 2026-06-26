export const NAV = [
  { label: 'Танилцуулга', href: '#hero' },
  { label: 'Баг', href: '#team' },
  { label: 'Асуудал', href: '#problem' },
  { label: 'Шийдэл', href: '#solution' },
  { label: 'Систем', href: '#features' },
]

export const TEAM = [
  {
    name: 'Норовсүрэн',
    role: 'Full-stack developer',
    initials: 'БЭ',
    focus: '',
    img: '/norvooEgch.JPG',
  },
  {
    name: 'Ганхөлөг',
    role: 'Full-stack developer',
    initials: 'ГМ',
    img: '/gankhulugAh.JPG',
    focus: '',
  },
  {
    name: 'Чингүүн',
    role: 'Full-stack developer',
    initials: 'ДТ',
    img: '/chinguunAh.png',
    focus: '',
  },
  {
    name: 'Ариунзул',
    role: 'Full-stack developer',
    initials: 'НС',
    img: '/zulaaEgch.JPG',
    focus: '',
  },
  {
    name: 'Мөнхжин',
    role: 'Full-stack developer',
    initials: 'ОБ',
    img: '/munkhjin.JPG',
    focus: '',
  },
]

export const PROBLEMS = [
  { stat: '70%', label: 'хүүхдийн шүд цоорсон', note: '6 настай Монгол хүүхдүүдийн дунд (НЭМҮТ)' },
  {
    stat: '1 / 10,000',
    label: 'сумын түвшинд шүдний эмч',
    note: 'Алслагдсан суманд эмчийн хүртээмж туйлын бага',
  },
  { stat: '300+ км', label: 'ойрын эмч хүртэлх зам', note: 'Олон айл нийслэл хүртэл явдаг' },
  {
    stat: '0',
    label: 'найдвартай triage хэрэгсэл',
    note: 'Эмч бус хүн ашиглах боломжтой багаж байхгүй',
  },
]

export const FEATURES = [
  {
    tag: '01',
    title: 'Веб самбар',
    body: 'Эмч, сумын эрүүл мэндийн ажилтан кейсүүдийг хянах, telemed зөвлөгөө өгөх удирдлагын самбар.',
  },
  {
    tag: '02',
    title: 'Гар утасны апп',
    body: 'Оффлайн-first камер апп — зураг авч, шууд төхөөрөмж дотроо AI triage хийнэ. Сүлжээ ороход sync болно.',
  },
  {
    tag: '03',
    title: 'Сервер',
    body: 'Зураг, telemetry-г аюулгүй хадгалж, эмч-эцэг эх хоёрыг холбож, тохиолдол бүрийн түүхийг хөтөлнө.',
  },
  {
    tag: '04',
    title: 'AI модель',
    body: 'Хүүхдийн шүдний зургаас цоорол, ёзоор, эрсдэлийг таньж, түвшинд ангилна.',
  },
]

export const TRIAGE = [
  {
    color: '#4CAF50',
    emoji: '🟢',
    label: 'Ногоон',
    title: 'Эрсдэл бага',
    body: 'Тогтмол эрүүл ахуй, 6 сар тутамд хяналт.',
  },
  {
    color: '#F5A623',
    emoji: '🟡',
    label: 'Шар',
    title: 'Анхаарал хандуул',
    body: 'Эмчид үзүүлэх төлөвлөгөө гарга. 2-4 долоо хоногт зөвлөгөө ав.',
  },
  {
    color: '#E5484D',
    emoji: '🔴',
    label: 'Улаан',
    title: 'Яаралтай',
    body: 'Telemed-ээр шүдний эмчтэй шууд холбогдож, чиглэл авна.',
  },
]
