import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Fish, MapPin, Cloud, TrendingUp, Plus, Calendar, Weight, Wind, Sunrise, Droplets, Anchor, Activity, Camera, Trophy, Users, Scan, Award, Info, Wrench, Target, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2 } from 'lucide-react'
import { api } from './services/api'
import './App.css'

interface Catch {
  id: number
  species: string
  weight: number
  length: number
  location: string
  date: string
  time: string
  weather: string
  baitUsed?: string
  photoUrl?: string
}

interface FishingSpot {
  id: number
  name: string
  catches: number
  rating: number
  distance: number
  latitude: number
  longitude: number
}

interface MarineWeather {
  temp: number
  windSpeed: number
  windDirection: string
  waveHeight: number
  pressure: number
  humidity: number
  visibility: number
}

interface PhotoGallery {
  id: number
  url: string
  catchId?: number
  date: string
  weight?: number
  friendName?: string
  caption?: string
}

interface Championship {
  id: number
  name: string
  location: string
  date: string
  prize: string
  participants: number
  maxParticipants: number
  status: 'open' | 'closed' | 'ongoing'
}

interface Sponsor {
  id: number
  name: string
  type: 'store' | 'factory' | 'prize'
  logo: string
  description: string
  discount?: string
}

interface CommunityPost {
  id: number
  name: string
  handle: string
  time: string
  text: string
  link?: string
  replies: number
  likes: number
  reposts: number
}

interface SubscriptionPlan {
  id: number
  name: string
  price: string
  features: string[]
  popular?: boolean
}

interface TideHeightPoint {
  dt: number
  height: number
}

interface TideExtremePoint {
  dt: number
  height: number
  type: 'High' | 'Low'
}

interface TideApiResponse {
  status?: number
  error?: string
  heights?: TideHeightPoint[]
  extremes?: TideExtremePoint[]
}

interface Friend {
  id: number
  name: string
  initials: string
  gradient: string
}

interface League {
  id: number
  name: string
  category: string
  rules: string
  invitedFriendIds: number[]
  prizePotEnabled?: boolean
  prizePotType?: 'fictitious' | 'real'
  entryFee?: number
  tournamentName?: string
  location?: string
  startAt?: string
  endAt?: string
  allowedSpecies?: string
  modality?: string
  boatMotor?: string
  acceptTerms?: boolean
  imageAuthorization?: boolean
  emergencyContact?: string
  liabilityTerm?: boolean
  weighingMethod?: string
  tiebreakCriteria?: string
  createdAt: number
}

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'catches' | 'spots' | 'subscription' | 'community' | 'leagues' | 'stats' | 'weather' | 'friendsGallery'>('home')
  const [showAddCatch, setShowAddCatch] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const [showAIScanner, setShowAIScanner] = useState(false)
  const [mapSpot, setMapSpot] = useState<FishingSpot | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoGallery | null>(null)
  const [galleryMode, setGalleryMode] = useState<'mine' | 'friends'>('mine')
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null)
  const [photoLikes, setPhotoLikes] = useState<Record<number, boolean>>({})
  const [photoComments, setPhotoComments] = useState<Record<number, string[]>>({})
  const [photoCaptions, setPhotoCaptions] = useState<Record<number, string>>({})
  const [showPhotoComments, setShowPhotoComments] = useState(false)
  const [newPhotoComment, setNewPhotoComment] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)

  const [tideLoading, setTideLoading] = useState(false)
  const [tideError, setTideError] = useState<string | null>(null)
  const [tideCurrentHeight, setTideCurrentHeight] = useState<number | null>(null)
  const [tideStatus, setTideStatus] = useState<string | null>(null)
  const [tideNext, setTideNext] = useState<{ time: string; type: string; height: number } | null>(null)
  const [tideAfterNext, setTideAfterNext] = useState<{ time: string; type: string; height: number } | null>(null)

  const [showCreateLeague, setShowCreateLeague] = useState(false)
  const [leagues, setLeagues] = useState<League[]>([])
  const [editingLeagueId, setEditingLeagueId] = useState<number | null>(null)
  const [rankingScope, setRankingScope] = useState<'city' | 'state' | 'country' | 'world'>('city')
  const [newLeague, setNewLeague] = useState({
    name: '',
    category: '',
    rules: '',
    invitedFriendIds: [] as number[],
    prizePotEnabled: false,
    prizePotType: 'fictitious' as 'fictitious' | 'real',
    entryFee: '',
    tournamentName: '',
    location: '',
    startAt: '',
    endAt: '',
    allowedSpecies: '',
    modality: '',
    boatMotor: '',
    acceptTerms: false,
    imageAuthorization: false,
    emergencyContact: '',
    liabilityTerm: false,
    weighingMethod: '',
    tiebreakCriteria: ''
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fishingapp.leagues.v1')
      if (!raw) return
      const parsed = JSON.parse(raw) as unknown
      if (!Array.isArray(parsed)) return
      setLeagues(parsed as League[])
    } catch {
      return
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('fishingapp.leagues.v1', JSON.stringify(leagues))
    } catch {
      return
    }
  }, [leagues])
  const [catches, setCatches] = useState<Catch[]>([
    {
      id: 1,
      species: 'Robalo',
      weight: 2.5,
      length: 45,
      location: 'Lagoa da Conceição',
      date: '2026-02-15',
      time: '06:30',
      weather: 'Ensolarado'
    },
    {
      id: 2,
      species: 'Corvina',
      weight: 3.2,
      length: 52,
      location: 'Praia da Armação',
      date: '2026-02-14',
      time: '17:45',
      weather: 'Nublado'
    }
  ])

  const [spots] = useState<FishingSpot[]>([
    { id: 1, name: 'Pesqueiro Maeda', catches: 45, rating: 4.8, distance: 12.5, latitude: -23.4892, longitude: -46.5731 },
    { id: 2, name: 'Represa Billings', catches: 38, rating: 4.6, distance: 15.2, latitude: -23.7833, longitude: -46.5667 },
    { id: 3, name: 'Represa Guarapiranga', catches: 32, rating: 4.5, distance: 18.3, latitude: -23.7167, longitude: -46.7333 },
    { id: 4, name: 'Lago do Taboão', catches: 28, rating: 4.4, distance: 22.1, latitude: -23.6167, longitude: -46.7833 },
    { id: 5, name: 'Pesqueiro Taquari', catches: 25, rating: 4.7, distance: 25.8, latitude: -23.5500, longitude: -46.6333 },
    { id: 6, name: 'Represa de Ponte Nova', catches: 22, rating: 4.3, distance: 28.5, latitude: -23.4833, longitude: -46.4167 },
    { id: 7, name: 'Pesqueiro Rancho Alegre', catches: 20, rating: 4.5, distance: 31.2, latitude: -23.5167, longitude: -46.8500 },
    { id: 8, name: 'Lago Parque Ibirapuera', catches: 18, rating: 4.2, distance: 8.7, latitude: -23.5875, longitude: -46.6575 }
  ])

  const [weather] = useState<MarineWeather>({
    temp: 23,
    windSpeed: 12,
    windDirection: 'NE',
    waveHeight: 0.8,
    pressure: 1013,
    humidity: 75,
    visibility: 10
  })

  const fishingCondition = 'Bom'
  const sunrise = '06:15'

  const friends = useMemo<Friend[]>(
    () => [
      { id: 1, name: 'John Fisher', initials: 'JF', gradient: 'from-blue-400 to-blue-600' },
      { id: 2, name: 'Mike Waters', initials: 'MW', gradient: 'from-green-400 to-green-600' },
      { id: 3, name: 'Sarah Ocean', initials: 'SO', gradient: 'from-purple-400 to-purple-600' }
    ],
    []
  )

  // Friends photos distributed among friends
  const friendsPhotosData = useMemo(() => {
    const allPhotos = [
      { url: '/friendscatches/pexels-aksbykas-6755885.jpg', weight: 4.8, date: '2026-02-16' },
      { url: '/friendscatches/pexels-brett-sayles-1143921.jpg', weight: 2.1, date: '2026-02-15' },
      { url: '/friendscatches/pexels-cottonbro-4828176.jpg', weight: 3.3, date: '2026-02-14' },
      { url: '/friendscatches/pexels-gasparzaldo-8671755.jpg', weight: 1.9, date: '2026-02-13' },
      { url: '/friendscatches/pexels-ionelceban-3010500.jpg', weight: 5.2, date: '2026-02-12' },
      { url: '/friendscatches/pexels-ionelceban-3796761.jpg', weight: 3.7, date: '2026-02-11' },
      { url: '/friendscatches/pexels-meruyert-gonullu-6034023.jpg', weight: 2.8, date: '2026-02-10' },
      { url: '/friendscatches/pexels-michal-dziekonski-2726786-4343735.jpg', weight: 4.1, date: '2026-02-09' },
      { url: '/friendscatches/pexels-thirdman-5538270.jpg', weight: 3.5, date: '2026-02-08' },
      { url: '/friendscatches/pexels-tima-miroshnichenko-6830975.jpg', weight: 4.5, date: '2026-02-07' },
      { url: '/friendscatches/pexels-tima-miroshnichenko-6830985.jpg', weight: 2.9, date: '2026-02-06' },
      { url: '/friendscatches/pexels-toulouse-3099187.jpg', weight: 3.8, date: '2026-02-05' },
      { url: '/friendscatches/pexels-vietnamese-private-tours-435436-1162639.jpg', weight: 2.3, date: '2026-02-04' }
    ]

    // Distribute photos among friends (13 photos / 3 friends = 4-5 photos each)
    const photosPerFriend = Math.floor(allPhotos.length / friends.length)
    const friendsData: Record<number, PhotoGallery[]> = {}
    
    friends.forEach((friend, index) => {
      const startIdx = index * photosPerFriend
      const endIdx = index === friends.length - 1 ? allPhotos.length : startIdx + photosPerFriend
      friendsData[friend.id] = allPhotos.slice(startIdx, endIdx).map((photo, photoIdx) => ({
        ...photo,
        id: 100 + index * 10 + photoIdx,
        friendName: friend.name
      })) as PhotoGallery[]
    })

    return friendsData
  }, [friends])

  // Global Ranking Mock Data
  const globalRanking = useMemo(() => ({
    city: { position: 12, total: 847, location: 'Florianópolis, SC' },
    state: { position: 45, total: 3521, location: 'Santa Catarina' },
    country: { position: 234, total: 18942, location: 'Brasil' },
    world: { position: 1847, total: 52103, location: 'Mundial' }
  }), [])

  const fetchTidesForLocation = useCallback(async (lat: number, lon: number) => {
    const apiKey = (import.meta as any).env?.VITE_WORLDTIDES_KEY as string | undefined
    if (!apiKey) {
      setTideError('Chave de API não configurada. Defina VITE_WORLDTIDES_KEY no .env e reinicie o servidor.')
      return
    }

    setTideLoading(true)
    setTideError(null)

    try {
      const url = new URL('https://www.worldtides.info/api/v3')
      url.searchParams.set('heights', '')
      url.searchParams.set('extremes', '')
      url.searchParams.set('date', 'today')
      url.searchParams.set('days', '1')
      url.searchParams.set('localtime', '1')
      url.searchParams.set('lat', String(lat))
      url.searchParams.set('lon', String(lon))
      url.searchParams.set('key', apiKey)

      const res = await fetch(url.toString())
      const data = (await res.json()) as TideApiResponse

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erro ao buscar marés')
      }

      const now = Math.floor(Date.now() / 1000)

      const heights = Array.isArray(data.heights) ? data.heights : []
      if (heights.length > 0) {
        const closest = heights.reduce((best, p) => {
          return Math.abs(p.dt - now) < Math.abs(best.dt - now) ? p : best
        }, heights[0])
        setTideCurrentHeight(Number(closest.height.toFixed(2)))
      } else {
        setTideCurrentHeight(null)
      }

      const extremes = Array.isArray(data.extremes) ? data.extremes : []
      const nextExtremes = extremes
        .filter((e) => e.dt >= now)
        .sort((a, b) => a.dt - b.dt)
        .slice(0, 2)

      const formatTime = (dt: number) => {
        return new Date(dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }

      const normalizeType = (t: 'High' | 'Low') => (t === 'High' ? 'Alta' : 'Baixa')

      setTideNext(
        nextExtremes[0]
          ? {
              time: formatTime(nextExtremes[0].dt),
              type: normalizeType(nextExtremes[0].type),
              height: Number(nextExtremes[0].height.toFixed(2))
            }
          : null
      )

      setTideAfterNext(
        nextExtremes[1]
          ? {
              time: formatTime(nextExtremes[1].dt),
              type: normalizeType(nextExtremes[1].type),
              height: Number(nextExtremes[1].height.toFixed(2))
            }
          : null
      )

      // Tendência aproximada: se a próxima maré for "Alta", estamos em enchente; se for "Baixa", vazante
      if (nextExtremes[0]) {
        setTideStatus(nextExtremes[0].type === 'High' ? 'Enchente' : 'Vazante')
      } else {
        setTideStatus(null)
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erro ao buscar marés'
      setTideError(message)
    } finally {
      setTideLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab !== 'weather') return
    if (tideLoading) return
    if (tideCurrentHeight !== null || tideNext !== null || tideError) return

    if (!('geolocation' in navigator)) {
      setTideError('Geolocalização não suportada neste dispositivo/navegador.')
      return
    }

    setTideLoading(true)
    setTideError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTideLoading(false)
        fetchTidesForLocation(pos.coords.latitude, pos.coords.longitude)
      },
      (err) => {
        setTideLoading(false)
        if (err.code === err.PERMISSION_DENIED) {
          setTideError('Permissão de localização negada. Habilite para ver as marés automaticamente.')
        } else {
          setTideError('Não foi possível obter sua localização para calcular as marés.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [activeTab, fetchTidesForLocation, tideCurrentHeight, tideError, tideLoading, tideNext])

  // V2.0 - Photo Gallery Data
  const [photoGallery] = useState<PhotoGallery[]>([
    { id: 1, url: '/home-gallery/ayoub-allaoui-r4UnstvRgkE-unsplash.jpg', catchId: 1, date: '2026-02-15', caption: 'Amanhecer perfeito na beira do mar' },
    { id: 2, url: '/home-gallery/cast-spear-hApQr0GDDP8-unsplash.jpg', catchId: 2, date: '2026-02-14', caption: 'Tentativa com lança — água bem clara' },
    { id: 3, url: '/home-gallery/clay-knight-Gn5i7ZWw00I-unsplash.jpg', catchId: 1, date: '2026-02-13', caption: 'Dia de vento, mas rendeu boas fotos' },
    { id: 4, url: '/home-gallery/diego-rubilar-NwEUY1xts1U-unsplash.jpg', catchId: 3, date: '2026-02-12', caption: 'Ponto novo testado hoje — promissor' },
    { id: 5, url: '/home-gallery/drew-farwell-0C20qeLQwi8-unsplash.jpg', catchId: 2, date: '2026-02-11' },
    { id: 6, url: '/home-gallery/jack-murrey-SIj8yWcxC0k-unsplash.jpg', catchId: 3, date: '2026-02-10' },
    { id: 7, url: '/home-gallery/jeff-vanderspank-8jh4zljhyDg-unsplash.jpg', catchId: 1, date: '2026-02-09' },
    { id: 8, url: '/home-gallery/jp-popham-BEK8qXGzF4A-unsplash.jpg', catchId: 2, date: '2026-02-08' },
    { id: 9, url: '/home-gallery/luis-arias-WnqewLN8Suk-unsplash.jpg', catchId: 3, date: '2026-02-07' },
    { id: 10, url: '/home-gallery/mael-balland-0asA95b8yzM-unsplash.jpg', catchId: 1, date: '2026-02-06' },
    { id: 11, url: '/home-gallery/michael-yero-AHrsj0zlN-E-unsplash.jpg', catchId: 2, date: '2026-02-05' },
    { id: 12, url: '/home-gallery/natali-martynova-akd9GO5srJ8-unsplash.jpg', catchId: 3, date: '2026-02-04' }
  ])

  const top3CatchIdsByWeight = useMemo(() => {
    return catches
      .slice()
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map((c) => c.id)
  }, [catches])

  const mineGalleryPhotos = useMemo(() => {
    const real = catches
      .filter((c) => typeof c.photoUrl === 'string' && c.photoUrl.length > 0)
      .map((c) => {
        const dateTime = c.time ? `${c.date}T${c.time}:00` : c.date
        return {
          id: c.id,
          url: c.photoUrl as string,
          catchId: c.id,
          date: dateTime,
          weight: c.weight
        } satisfies PhotoGallery
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const fallback = photoGallery
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((p) => {
        const match = typeof p.catchId === 'number' ? catches.find((c) => c.id === p.catchId) : undefined
        return {
          ...p,
          weight: match?.weight
        }
      })

    const realCatchIds = new Set(real.map((p) => p.catchId).filter((v): v is number => typeof v === 'number'))
    const combined = [...real, ...fallback.filter((p) => (typeof p.catchId === 'number' ? !realCatchIds.has(p.catchId) : true))]

    return combined
  }, [catches, photoGallery])

  const friendsGalleryPhotos = useMemo(() => {
    const mock = [
      { id: 101, url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500', date: '2026-02-16', weight: 4.8, friendName: 'John Fisher' },
      { id: 102, url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500', date: '2026-02-15', weight: 2.1, friendName: 'Mike Waters' },
      { id: 103, url: 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=500', date: '2026-02-14', weight: 3.3, friendName: 'Sarah Ocean' },
      { id: 104, url: 'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=500', date: '2026-02-13', weight: 1.9, friendName: 'John Fisher' },
      { id: 105, url: 'https://images.unsplash.com/photo-1520975869010-9391a1f7f95b?w=500', date: '2026-02-12', weight: 5.2, friendName: 'Mike Waters' },
      { id: 106, url: 'https://source.unsplash.com/tERfQLmWFvQ/800x1000', date: '2026-02-11', weight: 2.7, friendName: 'Sarah Ocean' },
      { id: 107, url: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=500', date: '2026-02-10', weight: 3.9, friendName: 'John Fisher' },
      { id: 108, url: 'https://source.unsplash.com/VBi_S5K9dsM/800x1000', date: '2026-02-09', weight: 1.4, friendName: 'Mike Waters' },
      { id: 109, url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500', date: '2026-02-08', weight: 6.0, friendName: 'Sarah Ocean' },
      { id: 110, url: 'https://source.unsplash.com/zBORpP97apw/800x1000', date: '2026-02-07', weight: 2.9, friendName: 'John Fisher' },
      { id: 111, url: 'https://source.unsplash.com/_NiWN9itkC4/800x1000', date: '2026-02-06', weight: 4.1, friendName: 'Mike Waters' },
      { id: 112, url: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=500', date: '2026-02-05', weight: 2.2, friendName: 'Sarah Ocean' }
    ]

    return mock.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [])

  const friendsTop3PhotoIdsByWeight = useMemo(() => {
    return friendsGalleryPhotos
      .slice()
      .sort((a, b) => (b.weight || 0) - (a.weight || 0))
      .slice(0, 3)
      .map((p) => p.id)
  }, [friendsGalleryPhotos])

  const zoomGalleryPhotos = useMemo(() => {
    if (activeTab === 'friendsGallery') {
      return galleryMode === 'mine' ? mineGalleryPhotos : friendsGalleryPhotos
    }
    return mineGalleryPhotos
  }, [activeTab, friendsGalleryPhotos, galleryMode, mineGalleryPhotos])

  const selectedZoomIndex = useMemo(() => {
    if (!selectedPhoto) return -1
    const idx = zoomGalleryPhotos.findIndex((p) => p.id === selectedPhoto.id)
    return idx
  }, [selectedPhoto, zoomGalleryPhotos])

  useEffect(() => {
    if (!selectedPhoto) {
      setShowPhotoComments(false)
      setNewPhotoComment('')
      return
    }
    setShowPhotoComments(false)
    setNewPhotoComment('')
  }, [selectedPhoto])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fishingapp.photoCaptions.v1')
      if (!raw) return
      const parsed = JSON.parse(raw) as unknown
      if (!parsed || typeof parsed !== 'object') return
      setPhotoCaptions(parsed as Record<number, string>)
    } catch {
      return
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('fishingapp.photoCaptions.v1', JSON.stringify(photoCaptions))
    } catch {
      return
    }
  }, [photoCaptions])

  const handleToggleLikePhoto = useCallback((photoId: number) => {
    setPhotoLikes((prev) => ({ ...prev, [photoId]: !prev[photoId] }))
  }, [])

  const handleAddPhotoComment = useCallback((photoId: number) => {
    const text = newPhotoComment.trim()
    if (!text) return
    setPhotoComments((prev) => ({ ...prev, [photoId]: [...(prev[photoId] || []), text] }))
    setNewPhotoComment('')
  }, [newPhotoComment])

  const handleShareSelectedPhoto = useCallback(async () => {
    if (!selectedPhoto) return
    const url = selectedPhoto.url
    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await (navigator as any).share({ title: 'Foto da pescaria', url })
        return
      }
    } catch {
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
        alert('Link copiado!')
        return
      }
    } catch {
    }

    try {
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      alert('Link copiado!')
    } catch {
      alert(url)
    }
  }, [selectedPhoto])

  // Championships Data
  const [championships] = useState<Championship[]>([
    { id: 1, name: 'São Paulo Bass Championship 2026', location: 'Represa Billings', date: '2026-03-15', prize: 'R$ 10,000', participants: 45, maxParticipants: 50, status: 'open' },
    { id: 2, name: 'Guarapiranga Fishing Tournament', location: 'Represa Guarapiranga', date: '2026-03-22', prize: 'R$ 5,000 + Equipments', participants: 32, maxParticipants: 40, status: 'open' },
    { id: 3, name: 'Winter Fishing Challenge', location: 'Pesqueiro Maeda', date: '2026-04-10', prize: 'R$ 8,000', participants: 28, maxParticipants: 35, status: 'open' },
    { id: 4, name: 'Taboão Lake Masters', location: 'Lago do Taboão', date: '2026-02-25', prize: 'R$ 3,000', participants: 25, maxParticipants: 25, status: 'ongoing' }
  ])

  // Sponsors Data
  const [sponsors] = useState<Sponsor[]>([
    { id: 1, name: 'Pesca & Cia', type: 'store', logo: '🏪', description: 'Complete fishing equipment store with 20% discount for members', discount: '20% OFF' },
    { id: 2, name: 'Marine Pro', type: 'factory', logo: '🏭', description: 'Premium fishing rods and reels manufacturer', discount: '15% OFF' },
    { id: 3, name: 'FishTech', type: 'factory', logo: '⚙️', description: 'Advanced fishing electronics and accessories' },
    { id: 4, name: 'Troféu Dourado', type: 'prize', logo: '🏆', description: 'Official championship prizes and awards supplier' },
    { id: 5, name: 'Anzol Forte', type: 'store', logo: '🪝', description: 'Hooks, lines, and baits specialist', discount: '10% OFF' }
  ])

  const [subscriptionPlans] = useState<SubscriptionPlan[]>([
    {
      id: 1,
      name: 'Free',
      price: 'R$ 0/month',
      features: ['Basic catch logging', 'View public spots', 'Community forum access', 'Up to 10 photos']
    },
    {
      id: 2,
      name: 'Pro',
      price: 'R$ 19.90/month',
      features: ['Unlimited catch logging', 'Advanced statistics', 'AI Fish Scanner', 'Unlimited photos', 'Priority support', 'Ad-free experience'],
      popular: true
    },
    {
      id: 3,
      name: 'Premium',
      price: 'R$ 39.90/month',
      features: ['All Pro features', 'Championship registration', 'Exclusive sponsor discounts', 'Weather predictions', 'Private fishing groups', 'Coaching sessions']
    }
  ])

  const [communityPosts] = useState<CommunityPost[]>([
    {
      id: 1,
      name: 'Rafa Pescador',
      handle: '@rafapesca',
      time: '2h',
      text: 'Dica rápida: na maré vazante, tenta trabalhar a isca mais lento e perto das estruturas. Aqui funcionou bem com camarão artificial. 🎣',
      replies: 12,
      likes: 84,
      reposts: 9
    },
    {
      id: 2,
      name: 'Marina Costa',
      handle: '@marinacosta',
      time: '4h',
      text: 'Qual o melhor nó pra leader fluorocarbon com multifilamento? Estou usando FG, mas às vezes escorrega se eu não aperto bem.',
      replies: 39,
      likes: 102,
      reposts: 7
    },
    {
      id: 3,
      name: 'Dicas do Mar',
      handle: '@dicasdomar',
      time: '6h',
      text: 'Mapa de vento/ondas (bem útil antes de sair). Vale conferir antes de escolher o ponto.',
      link: 'https://www.windy.com/',
      replies: 8,
      likes: 56,
      reposts: 11
    },
    {
      id: 4,
      name: 'João do Tucunaré',
      handle: '@joaotucunare',
      time: '1d',
      text: 'Opinião: mais importante que o equipamento é constância. Mesma isca, mesmo ponto, mudando só o ângulo e velocidade. Uma hora o peixe reage.',
      replies: 21,
      likes: 190,
      reposts: 25
    }
  ])

  const [newCatch, setNewCatch] = useState({
    species: '',
    weight: '',
    length: '',
    location: '',
    baitUsed: '',
    photoUrl: ''
  })

  const catchPhotoInputRef = useRef<HTMLInputElement | null>(null)
  const catchesAutoOpenedRef = useRef(false)
  const [showFishIdentified, setShowFishIdentified] = useState(false)
  const [identifiedSpecies, setIdentifiedSpecies] = useState('')
  const [identifyLoading, setIdentifyLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [photoCapturedAt, setPhotoCapturedAt] = useState<number | null>(null)

  const identifyFishFromFile = useCallback(async (file: File) => {
    const now = Date.now()
    const maxPhotoAgeMs = 2 * 60 * 1000
    if (now - file.lastModified > maxPhotoAgeMs) {
      setRegisterError('A foto deve ser capturada em tempo real (agora). Tire uma nova foto para registrar a captura.')
      return
    }

    setIdentifyLoading(true)
    setRegisterError(null)

    const url = URL.createObjectURL(file)
    setNewCatch((prev) => ({ ...prev, photoUrl: url }))
    setPhotoCapturedAt(now)

    await new Promise((r) => setTimeout(r, 900))
    const candidates = ['Tilápia', 'Traíra', 'Tucunaré', 'Robalo', 'Pacu', 'Carpa', 'Dourado', 'Bagre']
    const picked = candidates[Math.floor(Math.random() * candidates.length)]

    setIdentifiedSpecies(picked)
    setShowFishIdentified(true)
    setIdentifyLoading(false)
  }, [])

  const ensureAutoLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setRegisterError('Este dispositivo/navegador não suporta geolocalização. O registro só pode ser feito em tempo real com GPS.')
      return
    }

    setLocationLoading(true)
    setRegisterError(null)

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve(p),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      })

      const lat = pos.coords.latitude.toFixed(5)
      const lon = pos.coords.longitude.toFixed(5)
      setNewCatch((prev) => ({ ...prev, location: prev.location || `Lat ${lat}, Lon ${lon}` }))
    } catch (e) {
      const err = e as GeolocationPositionError
      if (typeof err?.code === 'number' && err.code === err.PERMISSION_DENIED) {
        setRegisterError('Permissão de localização negada. Para registrar em tempo real, habilite o GPS.')
      } else if (typeof err?.code === 'number' && err.code === err.TIMEOUT) {
        setRegisterError('Tempo esgotado ao obter sua localização. Tente novamente com o GPS ativo.')
      } else {
        setRegisterError('Não foi possível obter sua localização. O registro só pode ser feito em tempo real.')
      }
    } finally {
      setLocationLoading(false)
    }
  }, [])

  const handleAddCatch = useCallback(async () => {
    if (registerLoading) return

    const now = Date.now()
    const maxCaptureToRegisterMs = 5 * 60 * 1000
    if (!newCatch.photoUrl || !photoCapturedAt || now - photoCapturedAt > maxCaptureToRegisterMs) {
      setRegisterError('O registro só pode ser feito em tempo real. Tire uma nova foto e registre em seguida.')
      return
    }

    if (!newCatch.species || !newCatch.weight || !newCatch.location) {
      setRegisterError('Preencha espécie, peso e local para registrar.')
      return
    }

    if (!('geolocation' in navigator)) {
      setRegisterError('Este dispositivo/navegador não suporta geolocalização. O registro só pode ser feito em tempo real com GPS.')
      return
    }

    setRegisterLoading(true)
    setRegisterError(null)

    try {
      await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
      })

      const now = new Date()
      const catchPayload = {
        species: newCatch.species,
        weight: parseFloat(newCatch.weight),
        length: newCatch.length ? parseFloat(newCatch.length) : 0,
        location: newCatch.location,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().slice(0, 5),
        weather: 'Não informado',
        baitUsed: newCatch.baitUsed || undefined,
        photoUrl: newCatch.photoUrl || undefined
      }

      let savedCatch: Catch
      try {
        const fromApi = await api.createCatch(catchPayload)
        savedCatch = { ...fromApi, baitUsed: newCatch.baitUsed || undefined, photoUrl: newCatch.photoUrl || undefined }
      } catch {
        savedCatch = { id: catches.length + 1, ...catchPayload }
      }

      setCatches([savedCatch, ...catches])
      setNewCatch({ species: '', weight: '', length: '', location: '', baitUsed: '', photoUrl: '' })
      setPhotoCapturedAt(null)
      setShowAddCatch(false)
    } catch (e) {
      const err = e as GeolocationPositionError
      if (typeof err?.code === 'number' && err.code === err.PERMISSION_DENIED) {
        setRegisterError('Permissão de localização negada. Para registrar em tempo real, habilite o GPS.')
      } else if (typeof err?.code === 'number' && err.code === err.TIMEOUT) {
        setRegisterError('Tempo esgotado ao obter sua localização. Tente novamente com o GPS ativo.')
      } else {
        setRegisterError('Não foi possível obter sua localização. O registro só pode ser feito em tempo real.')
      }
    } finally {
      setRegisterLoading(false)
    }
  }, [catches, newCatch, registerLoading])

  useEffect(() => {
    if (activeTab === 'catches') {
      if (!catchesAutoOpenedRef.current) {
        catchesAutoOpenedRef.current = true
        setTimeout(() => {
          catchPhotoInputRef.current?.click()
        }, 250)
      }
      return
    }

    catchesAutoOpenedRef.current = false
  }, [activeTab])

  // Close registration modal when tab changes
  useEffect(() => {
    if (showAddCatch) {
      setShowAddCatch(false)
    }
  }, [activeTab])

  useEffect(() => {
    if (showAddCatch) {
      setRegisterError(null)
      setRegisterLoading(false)
      setIdentifiedSpecies('')
      setShowFishIdentified(false)
      if (!newCatch.photoUrl) {
        setPhotoCapturedAt(null)
      }
      ensureAutoLocation()
    }
  }, [ensureAutoLocation, newCatch.photoUrl, showAddCatch])

  useEffect(() => {
    if (showCreateLeague) return
    setEditingLeagueId(null)
    setNewLeague({
      name: '',
      category: '',
      rules: '',
      invitedFriendIds: [],
      prizePotEnabled: false,
      prizePotType: 'fictitious',
      entryFee: '',
      tournamentName: '',
      location: '',
      startAt: '',
      endAt: '',
      allowedSpecies: '',
      modality: '',
      boatMotor: '',
      acceptTerms: false,
      imageAuthorization: false,
      emergencyContact: '',
      liabilityTerm: false,
      weighingMethod: '',
      tiebreakCriteria: ''
    })
  }, [showCreateLeague])

  useEffect(() => {
    if (!showCreateLeague) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [showCreateLeague])

  const handleToggleInviteFriend = useCallback((friendId: number) => {
    setNewLeague((prev) => {
      const exists = prev.invitedFriendIds.includes(friendId)
      return {
        ...prev,
        invitedFriendIds: exists
          ? prev.invitedFriendIds.filter((id) => id !== friendId)
          : [...prev.invitedFriendIds, friendId]
      }
    })
  }, [])

  const handleCreateLeague = useCallback(() => {
    const now = Date.now()
    const fallbackName = 'Torneio sem nome'
    const fallbackCategory = 'Sem categoria'

    const entryFeeNumber = typeof newLeague.entryFee === 'string' && newLeague.entryFee.trim().length > 0 ? Number(newLeague.entryFee) : 0
    const entryFee = Number.isFinite(entryFeeNumber) ? entryFeeNumber : 0

    if (editingLeagueId !== null) {
      setLeagues((prev) =>
        prev.map((l) =>
          l.id !== editingLeagueId
            ? l
            : {
                ...l,
                name: newLeague.name || fallbackName,
                category: newLeague.category || fallbackCategory,
                rules: newLeague.rules,
                invitedFriendIds: newLeague.invitedFriendIds,
                prizePotEnabled: Boolean(newLeague.prizePotEnabled),
                prizePotType: newLeague.prizePotType,
                entryFee,
                tournamentName: newLeague.tournamentName,
                location: newLeague.location,
                startAt: newLeague.startAt,
                endAt: newLeague.endAt,
                allowedSpecies: newLeague.allowedSpecies,
                modality: newLeague.modality,
                boatMotor: newLeague.boatMotor,
                acceptTerms: newLeague.acceptTerms,
                imageAuthorization: newLeague.imageAuthorization,
                emergencyContact: newLeague.emergencyContact,
                liabilityTerm: newLeague.liabilityTerm,
                weighingMethod: newLeague.weighingMethod,
                tiebreakCriteria: newLeague.tiebreakCriteria
              }
        )
      )
      setShowCreateLeague(false)
      return
    }

    const created: League = {
      id: now,
      name: newLeague.name || fallbackName,
      category: newLeague.category || fallbackCategory,
      rules: newLeague.rules,
      invitedFriendIds: newLeague.invitedFriendIds,
      prizePotEnabled: Boolean(newLeague.prizePotEnabled),
      prizePotType: newLeague.prizePotType,
      entryFee,
      tournamentName: newLeague.tournamentName,
      location: newLeague.location,
      startAt: newLeague.startAt,
      endAt: newLeague.endAt,
      allowedSpecies: newLeague.allowedSpecies,
      modality: newLeague.modality,
      boatMotor: newLeague.boatMotor,
      acceptTerms: newLeague.acceptTerms,
      imageAuthorization: newLeague.imageAuthorization,
      emergencyContact: newLeague.emergencyContact,
      liabilityTerm: newLeague.liabilityTerm,
      weighingMethod: newLeague.weighingMethod,
      tiebreakCriteria: newLeague.tiebreakCriteria,
      createdAt: now
    }

    setLeagues((prev) => [created, ...prev])
    setShowCreateLeague(false)
  }, [editingLeagueId, newLeague])

  const handleEditLeague = useCallback((leagueId: number) => {
    const league = leagues.find((l) => l.id === leagueId)
    if (!league) return

    setEditingLeagueId(leagueId)
    setNewLeague({
      name: league.name || '',
      category: league.category || '',
      rules: league.rules || '',
      invitedFriendIds: league.invitedFriendIds || [],
      prizePotEnabled: Boolean(league.prizePotEnabled),
      prizePotType: league.prizePotType || 'fictitious',
      entryFee: typeof league.entryFee === 'number' ? String(league.entryFee) : '',
      tournamentName: league.tournamentName || '',
      location: league.location || '',
      startAt: league.startAt || '',
      endAt: league.endAt || '',
      allowedSpecies: league.allowedSpecies || '',
      modality: league.modality || '',
      boatMotor: league.boatMotor || '',
      acceptTerms: Boolean(league.acceptTerms),
      imageAuthorization: Boolean(league.imageAuthorization),
      emergencyContact: league.emergencyContact || '',
      liabilityTerm: Boolean(league.liabilityTerm),
      weighingMethod: league.weighingMethod || '',
      tiebreakCriteria: league.tiebreakCriteria || ''
    })
    setShowCreateLeague(true)
  }, [leagues])

  const leagueRankings = useMemo(() => {
    const parseMs = (value?: string) => {
      if (!value) return null
      const ms = new Date(value).getTime()
      return Number.isFinite(ms) ? ms : null
    }

    const getBestWeight = (weights: number[]) => {
      if (weights.length === 0) return 0
      return weights.reduce((best, w) => (w > best ? w : best), 0)
    }

    return leagues.reduce<Record<number, { participants: Array<{ key: string; name: string; bestWeight: number }>; potTotal: number }>>((acc, league) => {
      const startMs = parseMs(league.startAt)
      const endMs = parseMs(league.endAt)

      const isInWindow = (dateValue: string) => {
        const ms = new Date(dateValue).getTime()
        if (!Number.isFinite(ms)) return false
        if (startMs !== null && ms < startMs) return false
        if (endMs !== null && ms > endMs) return false
        return true
      }

      const myWeights = catches
        .filter((c) => (startMs !== null || endMs !== null ? isInWindow(c.date) : true))
        .map((c) => c.weight)
        .filter((w) => typeof w === 'number' && Number.isFinite(w))

      const invited = (league.invitedFriendIds || [])
        .map((id) => friends.find((f) => f.id === id))
        .filter((v): v is Friend => Boolean(v))

      const friendEntries = invited.map((f) => {
        const friendWeights = friendsGalleryPhotos
          .filter((p) => p.friendName === f.name)
          .filter((p) => (startMs !== null || endMs !== null ? isInWindow(p.date) : true))
          .map((p) => (typeof p.weight === 'number' ? p.weight : 0))
          .filter((w) => typeof w === 'number' && Number.isFinite(w))

        return {
          key: `friend-${f.id}`,
          name: f.name,
          bestWeight: getBestWeight(friendWeights)
        }
      })

      const participants = [
        { key: 'me', name: 'Você', bestWeight: getBestWeight(myWeights) },
        ...friendEntries
      ].sort((a, b) => b.bestWeight - a.bestWeight)

      const fee = typeof league.entryFee === 'number' && Number.isFinite(league.entryFee) ? league.entryFee : 0
      const potTotal = league.prizePotEnabled ? fee * participants.length : 0

      acc[league.id] = { participants, potTotal }
      return acc
    }, {})
  }, [catches, friends, friendsGalleryPhotos, leagues])

  const handleDeleteLeague = useCallback((leagueId: number) => {
    setLeagues((prev) => prev.filter((l) => l.id !== leagueId))
  }, [])

  // Close tips menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showTips && !target.closest('.tips-container')) {
        setShowTips(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTips])

  // Memoize computed values to avoid recalculation on every render
  const totalCatches = useMemo(() => catches.length, [catches])
  const totalWeight = useMemo(() => catches.reduce((sum, c) => sum + c.weight, 0), [catches])
  const avgWeight = useMemo(() => totalCatches > 0 ? (totalWeight / totalCatches).toFixed(1) : 0, [totalCatches, totalWeight])
  const biggestCatch = useMemo(() => catches.length > 0 ? Math.max(...catches.map(c => c.weight)) : 0, [catches])
  
  // Memoize sorted spots to avoid sorting on every render
  const sortedSpots = useMemo(() => [...spots].sort((a, b) => a.distance - b.distance), [spots])
  const nearestSpot = useMemo(() => sortedSpots[0], [sortedSpots])
  
  // Memoize fish species list
  const fishSpecies = useMemo(() => ['Tilápia', 'Traíra', 'Lambari', 'Tucunaré', 'Corvina', 'Robalo', 'Pacu', 'Pintado', 'Dourado', 'Bagre', 'Carpa', 'Piracanjuba', 'Curimbatá', 'Mandi', 'Cascudo'], [])

  return (
    <div className="min-h-screen pb-24 relative" style={{ background: "linear-gradient(180deg, hsl(200 60% 85%) 0%, hsl(175 50% 70%) 100%)" }}>
      {/* Background Image with Opacity and Wave Animation */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center ocean-wave pointer-events-none"
        style={{ 
          backgroundImage: "url('/Fundo.jpg')",
          opacity: 0.3
        }}
      />
      
      {activeTab === 'home' && (
        <div className="max-w-lg mx-auto relative z-10" style={{ padding: '5mm' }}>
          {/* Hero Section - Compact */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Anchor className="w-4 h-4 text-gray-700/70" />
                <span className="text-[10px] font-medium text-gray-700/70 tracking-wider uppercase">Good Fishing!</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Fisher's Guidapp<span className="text-gray-700 text-sm ml-2">v2.0</span>
              </h1>
            </div>
            
            {/* Tips Button */}
            <div className="relative tips-container">
              <button
                onClick={() => setShowTips(!showTips)}
                className="w-10 h-10 rounded-full transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                style={{
                  background: "transparent",
                  color: "hsl(210 80% 45%)"
                }}
              >
                <Info className="w-6 h-6" strokeWidth={2.5} />
              </button>
              
              {/* Tips Dropdown Menu */}
              {showTips && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-blue-100 overflow-hidden z-50">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3">
                    <h3 className="font-bold text-sm">📚 Fishing Tips</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    <button
                      onClick={() => {
                        setShowTips(false)
                        setActiveTab('weather')
                      }}
                      className="w-full text-left p-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                    >
                      <div className="font-semibold text-gray-800 text-sm">☀️ Clima e Condições</div>
                      <div className="text-xs text-gray-500 mt-0.5">Previsão do tempo e marés</div>
                    </button>
                    <a
                      href="https://www.youtube.com/results?search_query=nós+de+pesca+tutorial"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                    >
                      <div className="font-semibold text-gray-800 text-sm">🪢 Nós de Pesca</div>
                      <div className="text-xs text-gray-500 mt-0.5">Aprenda os principais nós</div>
                    </a>
                    <a
                      href="https://www.youtube.com/results?search_query=como+escolher+molinete+pesca"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                    >
                      <div className="font-semibold text-gray-800 text-sm">🎣 Molinetes e Carretilhas</div>
                      <div className="text-xs text-gray-500 mt-0.5">Como escolher o ideal</div>
                    </a>
                    <a
                      href="https://www.youtube.com/results?search_query=tipos+de+linha+de+pesca+nylon+multifilamento"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                    >
                      <div className="font-semibold text-gray-800 text-sm">🧵 Linhas e Fios</div>
                      <div className="text-xs text-gray-500 mt-0.5">Nylon, multifilamento e mais</div>
                    </a>
                    <a
                      href="https://www.youtube.com/results?search_query=como+escolher+vara+de+pesca"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                    >
                      <div className="font-semibold text-gray-800 text-sm">🎋 Varas de Pesca</div>
                      <div className="text-xs text-gray-500 mt-0.5">Tipos e características</div>
                    </a>
                    <a
                      href="https://www.youtube.com/results?search_query=iscas+artificiais+para+pesca"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                    >
                      <div className="font-semibold text-gray-800 text-sm">🐟 Iscas Artificiais</div>
                      <div className="text-xs text-gray-500 mt-0.5">Tipos e quando usar</div>
                    </a>
                    <a
                      href="https://www.youtube.com/results?search_query=técnicas+de+arremesso+pesca"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                    >
                      <div className="font-semibold text-gray-800 text-sm">💪 Técnicas de Arremesso</div>
                      <div className="text-xs text-gray-500 mt-0.5">Melhore sua precisão</div>
                    </a>
                    <a
                      href="https://www.youtube.com/results?search_query=manutenção+equipamento+pesca"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                    >
                      <div className="font-semibold text-gray-800 text-sm">🔧 Manutenção de Equipamentos</div>
                      <div className="text-xs text-gray-500 mt-0.5">Cuide do seu material</div>
                    </a>
                    <a
                      href="https://www.youtube.com/results?search_query=leitura+de+água+pesca"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-semibold text-gray-800 text-sm">🌊 Leitura de Água</div>
                      <div className="text-xs text-gray-500 mt-0.5">Encontre os melhores pontos</div>
                    </a>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Main Action Buttons - Large Square Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => setShowAddCatch(true)}
              className="aspect-square bg-white/60 backdrop-blur-md rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border border-white/50"
            >
              <Plus className="w-10 h-10 text-blue-600" strokeWidth={2.5} />
              <span className="text-xs font-bold text-gray-800">Register</span>
            </button>

            <button
              onClick={() => setActiveTab('catches')}
              className="aspect-square bg-white/60 backdrop-blur-md rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border border-white/50"
            >
              <Fish className="w-10 h-10 text-blue-600" strokeWidth={2} />
              <span className="text-xs font-bold text-gray-800">Catches</span>
            </button>

            <button
              onClick={() => setActiveTab('leagues')}
              className="aspect-square bg-white/60 backdrop-blur-md rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border border-white/50"
            >
              <Trophy className="w-10 h-10 text-amber-500" strokeWidth={2} />
              <span className="text-xs font-bold text-gray-800">Ligas</span>
            </button>
          </div>

          {/* Photo Gallery - Grid Layout */}
          <div className="mb-4">
            <div className="grid grid-cols-3" style={{ gap: '0.5mm' }}>
              {mineGalleryPhotos
                .slice()
                .sort((a, b) => {
                  const likesA = photoLikes[a.id] ? 1 : 0
                  const likesB = photoLikes[b.id] ? 1 : 0
                  return likesB - likesA
                })
                .slice(0, 9)
                .map((photo) => {
                const weight = typeof photo.weight === 'number' ? photo.weight : undefined
                const catchId = 'catchId' in photo ? photo.catchId : undefined
                const rankMine = typeof catchId === 'number' ? top3CatchIdsByWeight.indexOf(catchId) : -1

                return (
                  <div
                    key={photo.id}
                    onClick={() => setSelectedPhoto(photo)}
                    className="relative rounded-xl overflow-hidden shadow-md hover:scale-105 transition-transform cursor-pointer aspect-[4/5]"
                  >
                    <img src={photo.url} alt="Foto" className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                      <p className="text-white text-[10px] font-semibold">
                        {typeof weight === 'number' ? `${weight} kg` : '—'}
                      </p>
                    </div>

                    {rankMine >= 0 && (
                      <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/60 text-white rounded-full px-2 py-0.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-bold">{rankMine + 1}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'friendsGallery' && (
        <div className="pb-20 max-w-2xl mx-auto" style={{ padding: '5mm' }}>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-b-3xl shadow-lg">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-7 h-7" />
              Galeria dos Amigos
            </h1>
            <p className="text-blue-100 text-sm mt-1">Fotos de capturas dos pescadores conectados</p>
          </div>

          <div className="mt-4">
            <div className="bg-white rounded-2xl shadow-md p-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setGalleryMode('mine')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    galleryMode === 'mine' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Minhas fotos
                </button>
                <button
                  onClick={() => setGalleryMode('friends')}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    galleryMode === 'friends' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Fotos dos amigos
                </button>
              </div>
            </div>

            <div className="mt-3 bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="max-h-[70vh] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                <div className="grid grid-cols-3" style={{ gap: '0.5mm' }}>
                  {(galleryMode === 'mine' ? mineGalleryPhotos : friendsGalleryPhotos).map((photo) => {
                  const weight = typeof photo.weight === 'number' ? photo.weight : undefined
                  const catchId = 'catchId' in photo ? photo.catchId : undefined
                  const rankMine = galleryMode === 'mine' && typeof catchId === 'number'
                    ? top3CatchIdsByWeight.indexOf(catchId)
                    : -1
                  const rankFriends = galleryMode === 'friends'
                    ? friendsTop3PhotoIdsByWeight.indexOf(photo.id)
                    : -1
                  const rank = rankMine >= 0 ? rankMine : rankFriends

                    return (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedPhoto(photo)}
                        className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
                      >
                        <img src={photo.url} alt="Foto" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                          <p className="text-white text-[10px] font-semibold">
                            {typeof weight === 'number' ? `${weight} kg` : '—'}
                          </p>
                        </div>

                        {rank >= 0 && (
                          <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/60 text-white rounded-full px-2 py-0.5">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[10px] font-bold">{rank + 1}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {galleryMode === 'friends' && (
              <button className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Ver mais amigos
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'weather' && (
        <div className="pb-20 max-w-2xl mx-auto" style={{ padding: '5mm' }}>
          <div className="bg-gradient-to-r from-sky-600 to-blue-800 text-white p-6 rounded-b-3xl shadow-lg">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Cloud className="w-7 h-7" />
              Clima & Condições
            </h1>
            <p className="text-sky-100 text-sm mt-1">Acompanhe as condições para a sua próxima pescaria</p>
          </div>

          <div className="mt-4">
            <div
              className="rounded-2xl border-2 p-4"
              style={{
                background: "hsl(210 70% 20%)",
                borderColor: "rgba(255, 255, 255, 0.15)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 -2px 8px rgba(0, 0, 0, 0.2)"
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Fish className="w-4 h-4" style={{ color: "hsl(195 80% 55%)" }} />
                <h3 className="text-sm font-semibold" style={{ color: "hsl(45 20% 95%)" }}>Condições de Pesca</h3>
                <span
                  className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: "hsl(150 50% 40% / 0.3)",
                    color: "hsl(150 60% 60%)"
                  }}
                >
                  {fishingCondition}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center gap-0.5">
                  <Cloud className="w-4 h-4" style={{ color: "hsl(38 85% 60%)" }} />
                  <span className="text-[10px]" style={{ color: "hsl(210 15% 65%)" }}>Temp</span>
                  <span className="text-xs font-semibold" style={{ color: "hsl(45 20% 95%)" }}>{weather.temp}°</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <Droplets className="w-4 h-4" style={{ color: "hsl(195 80% 55%)" }} />
                  <span className="text-[10px]" style={{ color: "hsl(210 15% 65%)" }}>Umid</span>
                  <span className="text-xs font-semibold" style={{ color: "hsl(45 20% 95%)" }}>{weather.humidity}%</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <Wind className="w-4 h-4" style={{ color: "hsl(150 50% 50%)" }} />
                  <span className="text-[10px]" style={{ color: "hsl(210 15% 65%)" }}>Vento</span>
                  <span className="text-xs font-semibold" style={{ color: "hsl(45 20% 95%)" }}>{weather.windSpeed}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <Sunrise className="w-4 h-4" style={{ color: "hsl(38 85% 60%)" }} />
                  <span className="text-[10px]" style={{ color: "hsl(210 15% 65%)" }}>Nascer</span>
                  <span className="text-xs font-semibold" style={{ color: "hsl(45 20% 95%)" }}>{sunrise}</span>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl border-2 p-4 mt-3"
              style={{
                background: "hsl(210 65% 18%)",
                borderColor: "rgba(255, 255, 255, 0.15)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 -2px 8px rgba(0, 0, 0, 0.2)"
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Anchor className="w-4 h-4" style={{ color: "hsl(195 80% 55%)" }} />
                <h3 className="text-sm font-semibold" style={{ color: "hsl(45 20% 95%)" }}>Marés</h3>
                {tideStatus && (
                  <span
                    className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "hsl(195 70% 35% / 0.35)",
                      color: "hsl(195 85% 70%)"
                    }}
                  >
                    {tideStatus}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl p-3" style={{ background: "rgba(255, 255, 255, 0.06)" }}>
                  <p className="text-[10px]" style={{ color: "hsl(210 15% 65%)" }}>Altura atual</p>
                  {tideLoading ? (
                    <p className="text-sm font-semibold" style={{ color: "hsl(45 20% 95%)" }}>Carregando...</p>
                  ) : tideCurrentHeight !== null ? (
                    <p className="text-sm font-semibold" style={{ color: "hsl(45 20% 95%)" }}>{tideCurrentHeight} m</p>
                  ) : (
                    <p className="text-sm font-semibold" style={{ color: "hsl(45 20% 95%)" }}>—</p>
                  )}
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(255, 255, 255, 0.06)" }}>
                  <p className="text-[10px]" style={{ color: "hsl(210 15% 65%)" }}>Próxima maré</p>
                  {tideLoading ? (
                    <p className="text-sm font-semibold" style={{ color: "hsl(45 20% 95%)" }}>Carregando...</p>
                  ) : tideNext ? (
                    <>
                      <p className="text-sm font-semibold" style={{ color: "hsl(45 20% 95%)" }}>{tideNext.type} • {tideNext.time}</p>
                      <p className="text-[10px]" style={{ color: "hsl(210 15% 65%)" }}>{tideNext.height} m</p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold" style={{ color: "hsl(45 20% 95%)" }}>—</p>
                  )}
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(255, 255, 255, 0.06)" }}>
                  <p className="text-[10px]" style={{ color: "hsl(210 15% 65%)" }}>Depois</p>
                  {tideLoading ? (
                    <p className="text-sm font-semibold" style={{ color: "hsl(45 20% 95%)" }}>Carregando...</p>
                  ) : tideAfterNext ? (
                    <>
                      <p className="text-sm font-semibold" style={{ color: "hsl(45 20% 95%)" }}>{tideAfterNext.type} • {tideAfterNext.time}</p>
                      <p className="text-[10px]" style={{ color: "hsl(210 15% 65%)" }}>{tideAfterNext.height} m</p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold" style={{ color: "hsl(45 20% 95%)" }}>—</p>
                  )}
                </div>
                <div className="rounded-xl p-3" style={{ background: "rgba(255, 255, 255, 0.06)" }}>
                  <p className="text-[10px]" style={{ color: "hsl(210 15% 65%)" }}>Dica</p>
                  {tideError ? (
                    <p className="text-[11px]" style={{ color: "hsl(45 20% 95%)" }}>{tideError}</p>
                  ) : (
                    <p className="text-[11px]" style={{ color: "hsl(45 20% 95%)" }}>Em áreas costeiras, a troca de maré costuma ativar a pesca.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'catches' && (
        <div className="pb-20 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-b-3xl shadow-lg">
            {/* Toggle between Mine and Friends Gallery */}
            <div className="flex gap-3 max-w-md mx-auto">
              <button
                onClick={() => setGalleryMode('mine')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  galleryMode === 'mine'
                    ? 'bg-white text-blue-800 shadow-md'
                    : 'bg-blue-700/50 text-white hover:bg-blue-700'
                }`}
              >
                Minhas Capturas
              </button>
              <button
                onClick={() => setGalleryMode('friends')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  galleryMode === 'friends'
                    ? 'bg-white text-blue-800 shadow-md'
                    : 'bg-blue-700/50 text-white hover:bg-blue-700'
                }`}
              >
                Capturas dos Amigos
              </button>
            </div>
          </div>

          <input
            ref={catchPhotoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              void identifyFishFromFile(file)
              e.target.value = ''
            }}
          />

          <div className="p-4 space-y-3">

            {galleryMode === 'mine' && (
              <button
                onClick={() => catchPhotoInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-blue-900 transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Nova captura (tirar foto)
              </button>
            )}

            {identifyLoading && (
              <div className="bg-white p-4 rounded-2xl shadow-md">
                <p className="text-sm text-gray-700">Identificando peixe pela foto…</p>
              </div>
            )}

            {galleryMode === 'mine' && (
              <>
                {/* Photo Gallery - Complete */}
                <div>
                  <div className="grid grid-cols-3 gap-2">
                    {mineGalleryPhotos
                      .slice()
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((photo) => {
                        const weight = typeof photo.weight === 'number' ? photo.weight : undefined
                        const catchId = 'catchId' in photo ? photo.catchId : undefined
                        const rankMine = typeof catchId === 'number' ? top3CatchIdsByWeight.indexOf(catchId) : -1

                        return (
                          <div
                            key={photo.id}
                            onClick={() => setSelectedPhoto(photo)}
                            className="relative rounded-xl overflow-hidden shadow-md hover:scale-105 transition-transform cursor-pointer aspect-[4/5]"
                          >
                            <img src={photo.url} alt="Foto" className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                              <p className="text-white text-[10px] font-semibold">
                                {typeof weight === 'number' ? `${weight} kg` : '—'}
                              </p>
                            </div>

                            {rankMine >= 0 && (
                              <div className="absolute top-1 left-1 flex items-center gap-1 bg-black/60 text-white rounded-full px-2 py-0.5">
                                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-[10px] font-bold">{rankMine + 1}</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>
              </>
            )}

            {galleryMode === 'friends' && (
              <>
                {!selectedFriendId ? (
                  /* Friends List */
                  <div className="space-y-3">
                    {friends.map((friend) => {
                      const friendPhotos = friendsPhotosData[friend.id] || []
                      const photoCount = friendPhotos.length
                      
                      return (
                        <div
                          key={friend.id}
                          onClick={() => setSelectedFriendId(friend.id)}
                          className="bg-white rounded-2xl shadow-md p-4 cursor-pointer hover:shadow-lg transition-all active:scale-98"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${friend.gradient} flex items-center justify-center text-white font-bold text-xl shadow-md`}>
                              {friend.initials}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-800">{friend.name}</h3>
                              <p className="text-sm text-gray-600">{photoCount} {photoCount === 1 ? 'captura' : 'capturas'}</p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  /* Selected Friend's Photos */
                  <>
                    <button
                      onClick={() => setSelectedFriendId(null)}
                      className="flex items-center gap-2 text-blue-600 font-semibold mb-4 hover:text-blue-700 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Voltar para lista de amigos
                    </button>
                    
                    <div className="mb-4">
                      <div className="flex items-center gap-3">
                        {friends.find(f => f.id === selectedFriendId) && (
                          <>
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${friends.find(f => f.id === selectedFriendId)!.gradient} flex items-center justify-center text-white font-bold shadow-md`}>
                              {friends.find(f => f.id === selectedFriendId)!.initials}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                              {friends.find(f => f.id === selectedFriendId)!.name}
                            </h2>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {(friendsPhotosData[selectedFriendId] || [])
                        .slice()
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((photo) => {
                          const weight = typeof photo.weight === 'number' ? photo.weight : undefined

                          return (
                            <div
                              key={photo.id}
                              onClick={() => setSelectedPhoto(photo)}
                              className="relative rounded-xl overflow-hidden shadow-md hover:scale-105 transition-transform cursor-pointer aspect-[4/5]"
                            >
                              <img src={photo.url} alt="Foto" className="w-full h-full object-cover" />
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                                <p className="text-white text-[10px] font-semibold">
                                  {typeof weight === 'number' ? `${weight} kg` : '—'}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'spots' && (
        <div className="pb-20 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6 rounded-b-3xl shadow-lg">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="w-7 h-7" />
              Pontos de Pesca
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              {spots.length} locais cadastrados • Mais próximo: {nearestSpot.name} ({nearestSpot.distance} km)
            </p>
          </div>

          <div className="p-4 space-y-3">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Parceiros perto de você</h3>
                  <p className="text-xs text-gray-500">Descontos e indicações sutis</p>
                </div>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full">benefícios</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
                {sponsors.slice(0, 4).map((sponsor) => (
                  <div key={sponsor.id} className="min-w-[220px] bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl border border-indigo-100 flex-shrink-0">
                        {sponsor.logo}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-bold text-gray-800 truncate">{sponsor.name}</div>
                          {sponsor.discount && (
                            <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                              {sponsor.discount}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-600 line-clamp-2">{sponsor.description}</div>
                        <div className="mt-2">
                          <button className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 underline underline-offset-2">
                            Ver ofertas
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {sortedSpots.map((spot, index) => (
              <div key={spot.id} className="bg-white p-5 rounded-2xl shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-800">{spot.name}</h3>
                      <span className="text-sm font-semibold text-blue-600">{spot.distance} km</span>
                      {index === 0 && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          Mais próximo
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{spot.catches} capturas registradas</p>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                    <span className="text-yellow-500 text-lg">★</span>
                    <span className="font-bold text-gray-700">{spot.rating}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMapSpot(spot)}
                  className="w-full bg-blue-800 text-white py-2 rounded-xl font-semibold hover:bg-blue-900 transition-colors active:scale-95"
                >
                  Ver no Mapa
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {mapSpot && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999] p-4"
          onClick={(e) => {
            if (e.target !== e.currentTarget) return
            setMapSpot(null)
          }}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[58vh] bg-gradient-to-br from-slate-100 to-slate-200">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.18), transparent 45%), radial-gradient(circle at 80% 35%, rgba(16,185,129,0.18), transparent 40%), radial-gradient(circle at 45% 75%, rgba(99,102,241,0.18), transparent 45%)'
                }}
              />

              <div className="absolute top-3 left-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => setMapSpot(null)}
                  className="bg-white/90 backdrop-blur-md rounded-full px-3 py-2 text-sm font-bold text-gray-800 shadow"
                  aria-label="Voltar"
                >
                  ←
                </button>
                <div className="flex-1 bg-white/90 backdrop-blur-md rounded-2xl px-3 py-2 shadow">
                  <div className="text-sm font-bold text-gray-900 truncate">{mapSpot.name}</div>
                  <div className="text-[11px] text-gray-600 truncate">Lat {mapSpot.latitude.toFixed(5)} • Lon {mapSpot.longitude.toFixed(5)}</div>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-blue-600/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-blue-600" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-900">{mapSpot.distance.toFixed(1)} km</div>
                      <div className="text-xs text-gray-600">ETA: {Math.max(6, Math.round(mapSpot.distance * 3))} min</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-full">
                        {mapSpot.catches} capturas
                      </div>
                      <div className="text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-full">
                        ★ {mapSpot.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button className="w-full bg-blue-600 text-white py-3 rounded-2xl font-bold hover:bg-blue-700 transition-colors">
                      Iniciar
                    </button>
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps/search/?api=1&query=${mapSpot.latitude},${mapSpot.longitude}`
                        window.open(url, '_blank')
                      }}
                      className="w-full bg-gray-100 text-gray-800 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                    >
                      Abrir no Maps
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="pb-20 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-b-3xl shadow-lg">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-7 h-7" />
              Estatísticas
            </h1>
            <p className="text-green-100 text-sm mt-1">Seu desempenho na pesca</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Profile Photo Bubble */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div 
                  className="bubble-button rounded-full w-24 h-24 flex items-center justify-center overflow-hidden"
                  style={{ 
                    background: "hsl(195 70% 65%)",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 -2px 8px rgba(0, 0, 0, 0.1)",
                    border: "2px solid rgba(255, 255, 255, 0.3)"
                  }}
                >
                  <svg 
                    className="w-12 h-12 relative z-10" 
                    viewBox="0 0 24 24" 
                    fill="hsl(200 15% 75%)"
                    opacity="0.8"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                {/* Camera icon button */}
                <button
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  style={{
                    background: "hsl(195 80% 45%)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                    border: "2px solid white"
                  }}
                  onClick={() => {
                    // Trigger file input
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.click();
                  }}
                >
                  <svg 
                    className="w-4 h-4 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                </button>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Pescador</h2>
                <p className="text-sm text-gray-500">Membro desde 2026</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-5 rounded-2xl shadow-md text-center">
                <Fish className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-800">{totalCatches}</p>
                <p className="text-sm text-gray-500">Total de Capturas</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-md text-center">
                <Weight className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-800">{avgWeight}</p>
                <p className="text-sm text-gray-500">Peso Médio (kg)</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-md">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Recordes
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                  <span className="text-gray-700">Maior Captura</span>
                  <span className="font-bold text-green-700">{biggestCatch} kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="text-gray-700">Peso Total</span>
                  <span className="font-bold text-blue-700">{totalWeight.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                  <span className="text-gray-700">Locais Visitados</span>
                  <span className="font-bold text-purple-700">{spots.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-md">
              <h3 className="font-bold text-gray-800 mb-3">Espécies Mais Capturadas</h3>
              <div className="space-y-2">
                {Array.from(new Set(catches.map(c => c.species))).map((species, idx) => {
                  const count = catches.filter(c => c.species === species).length
                  return (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-700">{species}</span>
                      <span className="font-bold text-gray-800">{count}x</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Subscription Plans Section */}
            <div className="mt-6">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-4 rounded-t-2xl">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Planos de Assinatura
                </h3>
                <p className="text-purple-100 text-sm mt-1">Escolha o plano ideal para você</p>
              </div>
              
              <div className="space-y-3 mt-3">
                {subscriptionPlans.map((plan: SubscriptionPlan) => (
                  <div 
                    key={plan.id} 
                    className={`bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow ${
                      plan.popular ? 'ring-2 ring-purple-500 relative' : ''
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                          ⭐ MAIS POPULAR
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-xl font-bold text-gray-800">{plan.name}</h4>
                        <p className="text-2xl font-bold text-purple-600 mt-1">{plan.price}</p>
                      </div>
                      {plan.popular && (
                        <Trophy className="w-8 h-8 text-amber-500" />
                      )}
                    </div>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 font-bold mt-0.5">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      className={`w-full py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                        plan.popular 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {plan.id === 1 ? 'Plano Atual' : 'Assinar Agora'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leagues Tab */}
      {activeTab === 'leagues' && (
        <div className="pb-20 max-w-2xl mx-auto relative z-10">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-b-3xl shadow-lg">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-7 h-7" />
              Liga
            </h1>
            <p className="text-amber-100 text-sm mt-1">Competições e rankings entre pescadores</p>
          </div>

          <div className="p-4">
            {/* Global Ranking Section */}
            <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
              <h2 className="text-lg font-bold text-gray-800 mb-3">Seu Ranking Global</h2>
              
              {/* Scope Filter Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button
                  onClick={() => setRankingScope('city')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                    rankingScope === 'city'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cidade
                </button>
                <button
                  onClick={() => setRankingScope('state')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                    rankingScope === 'state'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Estado
                </button>
                <button
                  onClick={() => setRankingScope('country')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                    rankingScope === 'country'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  País
                </button>
                <button
                  onClick={() => setRankingScope('world')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                    rankingScope === 'world'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mundo
                </button>
              </div>

              {/* Ranking Display */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-gray-600">
                    {globalRanking[rankingScope].location}
                  </div>
                  <div className="flex items-center gap-1 text-amber-600">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs font-semibold">Ranking</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-amber-600">
                      #{globalRanking[rankingScope].position}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      de {globalRanking[rankingScope].total.toLocaleString('pt-BR')} pescadores
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">
                      Top {((globalRanking[rankingScope].position / globalRanking[rankingScope].total) * 100).toFixed(1)}%
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
                        style={{ 
                          width: `${Math.min(100, (1 - globalRanking[rankingScope].position / globalRanking[rankingScope].total) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Crie sua própria liga</h2>
                  <p className="text-sm text-gray-600">Defina categoria, regras e convide amigos</p>
                </div>
                <button
                  onClick={() => setShowCreateLeague(true)}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-700 transition-colors"
                >
                  Criar
                </button>
              </div>
            </div>

            {leagues.length > 0 ? (
              <div className="space-y-3">
                {leagues.map((l) => (
                  <div key={l.id} className="bg-white rounded-2xl shadow-md p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{l.name}</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Categoria: <span className="font-semibold">{l.category}</span></p>
                        {l.rules && <p className="text-sm text-gray-600 mt-1">{l.rules}</p>}
                        {(l.location || l.startAt || l.endAt || l.allowedSpecies || l.modality || l.boatMotor) && (
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                            {l.location && (
                              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2">
                                <span className="font-semibold">Local:</span> {l.location}
                              </div>
                            )}
                            {l.startAt && (
                              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2">
                                <span className="font-semibold">Início:</span> {l.startAt}
                              </div>
                            )}
                            {l.endAt && (
                              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2">
                                <span className="font-semibold">Fim:</span> {l.endAt}
                              </div>
                            )}
                            {l.allowedSpecies && (
                              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2 col-span-2">
                                <span className="font-semibold">Espécies:</span> {l.allowedSpecies}
                              </div>
                            )}
                            {l.modality && (
                              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2">
                                <span className="font-semibold">Modalidade:</span> {l.modality}
                              </div>
                            )}
                            {l.boatMotor && (
                              <div className="bg-gray-50 border border-gray-100 rounded-xl p-2">
                                <span className="font-semibold">Embarcação/Motor:</span> {l.boatMotor}
                              </div>
                            )}
                          </div>
                        )}

                        {(l.acceptTerms || l.imageAuthorization || l.emergencyContact || l.liabilityTerm || l.weighingMethod || l.tiebreakCriteria) && (
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                            {typeof l.acceptTerms === 'boolean' && (
                              <div className="bg-amber-50 border border-amber-100 rounded-xl p-2">
                                <span className="font-semibold">Aceite termos:</span> {l.acceptTerms ? 'Sim' : 'Não'}
                              </div>
                            )}
                            {typeof l.imageAuthorization === 'boolean' && (
                              <div className="bg-amber-50 border border-amber-100 rounded-xl p-2">
                                <span className="font-semibold">Uso de imagem:</span> {l.imageAuthorization ? 'Sim' : 'Não'}
                              </div>
                            )}
                            {l.emergencyContact && (
                              <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 col-span-2">
                                <span className="font-semibold">Emergência:</span> {l.emergencyContact}
                              </div>
                            )}
                            {typeof l.liabilityTerm === 'boolean' && (
                              <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 col-span-2">
                                <span className="font-semibold">Termo de responsabilidade:</span> {l.liabilityTerm ? 'Sim' : 'Não'}
                              </div>
                            )}
                            {l.weighingMethod && (
                              <div className="bg-amber-50 border border-amber-100 rounded-xl p-2">
                                <span className="font-semibold">Pesagem:</span> {l.weighingMethod}
                              </div>
                            )}
                            {l.tiebreakCriteria && (
                              <div className="bg-amber-50 border border-amber-100 rounded-xl p-2">
                                <span className="font-semibold">Desempate:</span> {l.tiebreakCriteria}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2">
                          {l.invitedFriendIds.length > 0 ? (
                            l.invitedFriendIds.map((id) => {
                              const f = friends.find((x) => x.id === id)
                              if (!f) return null
                              return (
                                <div
                                  key={id}
                                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 border border-amber-200"
                                >
                                  <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${f.gradient} text-white flex items-center justify-center text-[10px] font-bold`}>
                                    {f.initials}
                                  </div>
                                  <span className="text-xs font-semibold text-amber-900">{f.name.split(' ')[0]}</span>
                                </div>
                              )
                            })
                          ) : (
                            <span className="text-xs text-gray-500">Sem convites ainda</span>
                          )}
                        </div>

                        {leagueRankings[l.id] && (
                          <div className="mt-4 bg-gray-50 border border-gray-100 rounded-2xl p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-sm font-bold text-gray-800">Ranking (maior peixe)</div>
                              {l.prizePotEnabled && (
                                <div className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-1">
                                  Caixinha: {l.prizePotType === 'real' ? 'Real' : 'Fictícia'} • Total {leagueRankings[l.id].potTotal.toFixed(2)}
                                </div>
                              )}
                            </div>
                            <div className="mt-2 space-y-2">
                              {leagueRankings[l.id].participants.map((p, idx) => (
                                <div key={p.key} className="flex items-center justify-between gap-2 bg-white rounded-xl border border-gray-100 px-3 py-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 text-amber-900 flex items-center justify-center text-xs font-bold shrink-0">
                                      {idx + 1}
                                    </div>
                                    <div className="text-sm font-semibold text-gray-800 truncate">{p.name}</div>
                                  </div>
                                  <div className="text-sm font-bold text-gray-900 whitespace-nowrap">{p.bestWeight.toFixed(1)} kg</div>
                                </div>
                              ))}
                            </div>
                            {(l.startAt || l.endAt) && (
                              <div className="mt-2 text-[11px] text-gray-600">
                                Prazo: {l.startAt ? new Date(l.startAt).toLocaleString('pt-BR') : '—'} até {l.endAt ? new Date(l.endAt).toLocaleString('pt-BR') : '—'}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={() => handleEditLeague(l.id)}
                            className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteLeague(l.id)}
                            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-500 whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Nenhuma liga criada</h3>
                <p className="text-sm text-gray-600 mt-1">Crie uma liga e convide seus amigos para competir</p>
              </div>
            )}

            <div className="mt-6">
              <div className="bg-white rounded-2xl shadow-md p-4 mb-4">
                <h2 className="text-lg font-bold text-gray-800">Torneios</h2>
                <p className="text-sm text-gray-600">Inscreva-se em competições</p>
              </div>

              <div className="space-y-4">
                {championships.map((championship) => (
                  <div key={championship.id} className="bg-white rounded-xl p-5 shadow-md">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{championship.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{championship.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(championship.date).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        championship.status === 'open' ? 'bg-green-100 text-green-700' :
                        championship.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {championship.status === 'open' ? '🟢 Aberto' : championship.status === 'ongoing' ? '🔵 Em Andamento' : '🔴 Fechado'}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 text-amber-800">
                        <Trophy className="w-5 h-5" />
                        <span className="font-bold">Prêmio: {championship.prize}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm text-gray-600">
                        <Users className="w-4 h-4 inline mr-1" />
                        <span className="font-semibold">{championship.participants}/{championship.maxParticipants}</span> participantes
                      </div>
                      <div className="w-full max-w-[200px] bg-gray-200 rounded-full h-2 ml-3">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${(championship.participants / championship.maxParticipants) * 100}%` }}
                        />
                      </div>
                    </div>

                    {championship.status === 'open' && (
                      <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition-all shadow-md">
                        Inscrever-se Agora
                      </button>
                    )}
                    {championship.status === 'ongoing' && (
                      <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition-all shadow-md">
                        Ver Resultados ao Vivo
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateLeague && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ padding: '5mm' }}>
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Criar Liga</h2>
              <button
                onClick={() => setShowCreateLeague(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="text-sm font-bold text-amber-900 mb-2">Informações Técnicas e Estruturais</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nome do Torneio"
                    value={newLeague.tournamentName}
                    onChange={(e) => setNewLeague({ ...newLeague, tournamentName: e.target.value })}
                    className="w-full p-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Local/Pesqueiro"
                    value={newLeague.location}
                    onChange={(e) => setNewLeague({ ...newLeague, location: e.target.value })}
                    className="w-full p-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="datetime-local"
                      value={newLeague.startAt}
                      onChange={(e) => setNewLeague({ ...newLeague, startAt: e.target.value })}
                      className="w-full p-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                    />
                    <input
                      type="datetime-local"
                      value={newLeague.endAt}
                      onChange={(e) => setNewLeague({ ...newLeague, endAt: e.target.value })}
                      className="w-full p-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Espécies Permitidas (ex: Tambacu, Tucunaré, Tilápia)"
                    value={newLeague.allowedSpecies}
                    onChange={(e) => setNewLeague({ ...newLeague, allowedSpecies: e.target.value })}
                    className="w-full p-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Modalidade (Pesca esportiva / pesque e pague)"
                    value={newLeague.modality}
                    onChange={(e) => setNewLeague({ ...newLeague, modality: e.target.value })}
                    className="w-full p-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Tipo de Embarcação/Motor (se aplicável)"
                    value={newLeague.boatMotor}
                    onChange={(e) => setNewLeague({ ...newLeague, boatMotor: e.target.value })}
                    className="w-full p-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                  />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <div className="text-sm font-bold text-gray-800 mb-2">Regulamento e Conformidade</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={newLeague.acceptTerms}
                      onChange={(e) => setNewLeague({ ...newLeague, acceptTerms: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Aceite dos Termos
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={newLeague.imageAuthorization}
                      onChange={(e) => setNewLeague({ ...newLeague, imageAuthorization: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Autorização de Uso de Imagem
                  </label>
                  <input
                    type="text"
                    placeholder="Contato de Emergência"
                    value={newLeague.emergencyContact}
                    onChange={(e) => setNewLeague({ ...newLeague, emergencyContact: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={newLeague.liabilityTerm}
                      onChange={(e) => setNewLeague({ ...newLeague, liabilityTerm: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Termo de Responsabilidade
                  </label>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <div className="text-sm font-bold text-gray-800 mb-2">Critérios de Premiação (Pontuação)</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Método de Pesagem/Medição"
                    value={newLeague.weighingMethod}
                    onChange={(e) => setNewLeague({ ...newLeague, weighingMethod: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Critério de Desempate"
                    value={newLeague.tiebreakCriteria}
                    onChange={(e) => setNewLeague({ ...newLeague, tiebreakCriteria: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <div className="text-sm font-bold text-gray-800 mb-2">Caixinha/premiação</div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={Boolean(newLeague.prizePotEnabled)}
                      onChange={(e) => setNewLeague({ ...newLeague, prizePotEnabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    Ativar caixinha
                  </label>

                  {newLeague.prizePotEnabled && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={newLeague.prizePotType}
                          onChange={(e) => setNewLeague({ ...newLeague, prizePotType: e.target.value as 'fictitious' | 'real' })}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-white"
                        >
                          <option value="fictitious">Fictício</option>
                          <option value="real">Real</option>
                        </select>
                        <input
                          inputMode="decimal"
                          placeholder="Valor de entrada"
                          value={newLeague.entryFee}
                          onChange={(e) => setNewLeague({ ...newLeague, entryFee: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div className="text-[11px] text-gray-600">
                        Total arrecadado estimado = entrada × participantes ({(() => {
                          const entryFee = typeof newLeague.entryFee === 'string' && newLeague.entryFee.trim().length > 0 ? Number(newLeague.entryFee) : 0
                          const participants = 1 + newLeague.invitedFriendIds.length
                          const safeFee = Number.isFinite(entryFee) ? entryFee : 0
                          const total = safeFee * participants
                          return `${total.toFixed(2)}`
                        })()})
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-3">
                <div className="text-sm font-bold text-gray-800 mb-2">Campos básicos (opcionais)</div>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nome (aparece na lista)"
                    value={newLeague.name}
                    onChange={(e) => setNewLeague({ ...newLeague, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Categoria"
                    value={newLeague.category}
                    onChange={(e) => setNewLeague({ ...newLeague, category: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                  <textarea
                    placeholder="Regras"
                    value={newLeague.rules}
                    onChange={(e) => setNewLeague({ ...newLeague, rules: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none min-h-[90px]"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="text-sm font-bold text-amber-900 mb-2">Convidar amigos</div>
                <div className="flex flex-wrap gap-2">
                  {friends.map((f) => {
                    const selected = newLeague.invitedFriendIds.includes(f.id)
                    return (
                      <button
                        key={f.id}
                        onClick={() => handleToggleInviteFriend(f.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                          selected
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${f.gradient} text-white flex items-center justify-center text-xs font-bold`}>
                          {f.initials}
                        </div>
                        <span className="text-sm font-semibold">{f.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={handleCreateLeague}
                className="w-full py-3 rounded-xl font-semibold transition-colors bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
              >
                {editingLeagueId !== null ? 'Salvar Alterações' : 'Criar Liga'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community/Forum Tab - Coming Soon */}
      {activeTab === 'community' && (
        <div className="pb-20 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-b-3xl shadow-lg">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-7 h-7" />
              Amigos
            </h1>
            <p className="text-purple-100 text-sm mt-1">Dicas, opiniões, links e comentários</p>
          </div>

          <div className="p-4 space-y-3">
            {communityPosts.map((post) => (
              <div key={post.id} className="bg-blue-50/95 backdrop-blur-sm rounded-2xl shadow-md p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 border border-purple-200 flex items-center justify-center font-bold text-purple-800 flex-shrink-0">
                    {(post.name.split(' ')[0]?.[0] || 'P') + (post.name.split(' ')[1]?.[0] || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">{post.name}</span>
                      <span className="text-sm text-gray-500">{post.handle}</span>
                      <span className="text-sm text-gray-400">• {post.time}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-800 leading-relaxed">
                      {post.text}
                    </div>
                    {post.link && (
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 block text-sm text-blue-700 hover:underline break-all"
                      >
                        {post.link}
                      </a>
                    )}

                    <div className="mt-3 flex items-center justify-between text-gray-500">
                      <button className="flex items-center gap-2 text-xs font-semibold hover:text-gray-700">
                        <MessageCircle className="w-4 h-4" />
                        {post.replies}
                      </button>
                      <button className="flex items-center gap-2 text-xs font-semibold hover:text-gray-700">
                        <Share2 className="w-4 h-4" />
                        {post.reposts}
                      </button>
                      <button className="flex items-center gap-2 text-xs font-semibold hover:text-gray-700">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Championships Tab */}
      {false && (
        <div className="pb-20 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-orange-600 to-red-700 text-white p-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wrench className="w-7 h-7" />
              Equipamentos
            </h1>
            <p className="text-xs text-orange-100 mt-1">Escolha o equipamento adequado</p>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" />
                Varas de Pesca
              </h3>
              <div className="space-y-3">
                <div className="bg-orange-50 p-4 rounded-xl border-l-4 border-orange-500">
                  <h4 className="font-semibold text-orange-900 mb-2">Vara de Molinete</h4>
                  <p className="text-sm text-gray-700 mb-2">Ideal para iniciantes. Versátil para diversas técnicas.</p>
                  <p className="text-xs text-gray-600">Tamanho: 1,80m - 2,70m | Ação: Média</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500">
                  <h4 className="font-semibold text-red-900 mb-2">Vara de Carretilha</h4>
                  <p className="text-sm text-gray-700 mb-2">Para pescadores experientes. Maior precisão no arremesso.</p>
                  <p className="text-xs text-gray-600">Tamanho: 1,50m - 2,40m | Ação: Rápida</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-900 mb-2">Vara de Fly</h4>
                  <p className="text-sm text-gray-700 mb-2">Pesca com mosca. Técnica específica para rios.</p>
                  <p className="text-xs text-gray-600">Tamanho: 2,40m - 3,00m | Ação: Leve</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3">Molinete vs Carretilha</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 p-3 rounded-xl">
                  <p className="font-bold text-green-800 mb-2">✓ Molinete</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Fácil de usar</li>
                    <li>• Menos emaranhados</li>
                    <li>• Ótimo para iniciantes</li>
                    <li>• Versátil</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl">
                  <p className="font-bold text-blue-800 mb-2">✓ Carretilha</p>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Mais precisa</li>
                    <li>• Maior controle</li>
                    <li>• Peixes maiores</li>
                    <li>• Requer prática</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Linhas e Anzóis
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-semibold text-purple-900 mb-1">Linha Monofilamento</p>
                  <p className="text-xs text-gray-600">0,25mm - 0,50mm | Resistência: 6-20kg</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="font-semibold text-indigo-900 mb-1">Linha Multifilamento</p>
                  <p className="text-xs text-gray-600">0,15mm - 0,40mm | Maior sensibilidade</p>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <p className="font-semibold text-pink-900 mb-1">Anzóis</p>
                  <p className="text-xs text-gray-600">Tamanhos: #2 a #10 | Escolha conforme o peixe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* {activeTab === 'baits' && (
        <div className="pb-20 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Worm className="w-7 h-7" />
              Iscas
            </h1>
            <p className="text-xs text-green-100 mt-1">Naturais e artificiais</p>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Iscas Naturais
              </h3>
              <div className="space-y-2">
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-green-900">🪱 Minhocas</h4>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Universal</span>
                  </div>
                  <p className="text-sm text-gray-700">Excelente para água doce. Atrai diversas espécies.</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-orange-900">🦐 Camarões</h4>
                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">Mar</span>
                  </div>
                  <p className="text-sm text-gray-700">Ideal para pesca marítima. Robalos e corvinas adoram.</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-blue-900">🐟 Lambaris</h4>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Predadores</span>
                  </div>
                  <p className="text-sm text-gray-700">Para peixes grandes. Traíras, dourados e tucunarés.</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-yellow-900">🌽 Milho/Massa</h4>
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">Pacíficos</span>
                  </div>
                  <p className="text-sm text-gray-700">Carpas, tilápias e pacus. Econômico e eficaz.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-600" />
                Iscas Artificiais
              </h3>
              <div className="space-y-2">
                <div className="bg-red-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-red-900 mb-2">🎣 Plugs</h4>
                  <p className="text-sm text-gray-700 mb-2">Imitam peixes. Diversos modelos e cores.</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs bg-red-100 px-2 py-1 rounded">Meia-água</span>
                    <span className="text-xs bg-red-100 px-2 py-1 rounded">Superfície</span>
                    <span className="text-xs bg-red-100 px-2 py-1 rounded">Fundo</span>
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-purple-900 mb-2">🎯 Jigs</h4>
                  <p className="text-sm text-gray-700 mb-2">Cabeça de chumbo com silicone. Versátil.</p>
                  <p className="text-xs text-gray-600">Ideal para: Robalos, garoupas, badejos</p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-cyan-900 mb-2">🌀 Spinners</h4>
                  <p className="text-sm text-gray-700 mb-2">Colheres giratórias que refletem luz.</p>
                  <p className="text-xs text-gray-600">Ideal para: Traíras, black bass, tucunarés</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-pink-900 mb-2">🦑 Soft Baits</h4>
                  <p className="text-sm text-gray-700 mb-2">Iscas de silicone macias e realistas.</p>
                  <p className="text-xs text-gray-600">Ideal para: Diversos predadores</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl p-4 border-2 border-amber-300">
              <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                💡 Dica Importante
              </h4>
              <p className="text-sm text-gray-800">Varie as iscas até encontrar a preferida dos peixes no dia. Condições climáticas e horário influenciam na escolha.</p>
            </div>
          </div>
        </div>
      )}

      */ } {/* {activeTab === 'times' && (
        <div className="pb-20 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-purple-600 to-pink-700 text-white p-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Timer className="w-7 h-7" />
              Horários Estratégicos
            </h1>
            <p className="text-xs text-purple-100 mt-1">Melhores momentos para pescar</p>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Sunrise className="w-8 h-8" />
                <div>
                  <h3 className="font-bold text-lg">Amanhecer</h3>
                  <p className="text-sm opacity-90">05:00 - 08:00</p>
                </div>
              </div>
              <p className="text-sm mb-2">⭐ Horário PREMIUM para pesca!</p>
              <p className="text-sm opacity-90">Peixes estão mais ativos e famintos após a noite. Temperatura agradável e menos movimento.</p>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <Sunset className="w-8 h-8" />
                <div>
                  <h3 className="font-bold text-lg">Entardecer</h3>
                  <p className="text-sm opacity-90">17:00 - 19:30</p>
                </div>
              </div>
              <p className="text-sm mb-2">⭐ Horário PREMIUM para pesca!</p>
              <p className="text-sm opacity-90">Segunda melhor opção. Peixes se alimentam antes do anoitecer. Luz baixa favorece predadores.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Outros Horários
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-yellow-900">☀️ Meio-dia (11:00-14:00)</p>
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">Regular</span>
                  </div>
                  <p className="text-xs text-gray-600">Sol forte. Peixes buscam sombra e profundidade. Menos produtivo.</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-blue-900">🌙 Noite (20:00-23:00)</p>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Bom</span>
                  </div>
                  <p className="text-xs text-gray-600">Predadores noturnos ativos. Requer equipamento adequado e cuidado.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Moon className="w-5 h-5 text-purple-600" />
                Influência da Lua
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 text-white p-3 rounded-xl text-center">
                  <p className="text-2xl mb-1">🌑</p>
                  <p className="font-semibold text-sm">Lua Nova</p>
                  <p className="text-xs opacity-75 mt-1">Ótimo</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-xl text-center">
                  <p className="text-2xl mb-1">🌓</p>
                  <p className="font-semibold text-sm">Crescente</p>
                  <p className="text-xs text-gray-600 mt-1">Bom</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-xl text-center">
                  <p className="text-2xl mb-1">🌕</p>
                  <p className="font-semibold text-sm">Lua Cheia</p>
                  <p className="text-xs text-gray-600 mt-1">Excelente</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-xl text-center">
                  <p className="text-2xl mb-1">🌗</p>
                  <p className="font-semibold text-sm">Minguante</p>
                  <p className="text-xs text-gray-600 mt-1">Regular</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl p-4 border-2 border-cyan-300">
              <h4 className="font-bold text-cyan-900 mb-2">📅 Dias da Semana</h4>
              <p className="text-sm text-gray-800 mb-2">Dias úteis geralmente são melhores que finais de semana devido ao menor movimento de pessoas.</p>
              <p className="text-xs text-gray-700">Menos barulho = mais peixes!</p>
            </div>
          </div>
        </div>
      )}

      */ } {/* {activeTab === 'techniques' && (
        <div className="pb-20 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-7 h-7" />
              Técnicas e Paciência
            </h1>
            <p className="text-xs text-blue-100 mt-1">Domine as técnicas de pesca</p>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Arremesso
              </h3>
              <div className="space-y-3">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-blue-900 mb-2">1. Posicionamento</h4>
                  <p className="text-sm text-gray-700">Pés afastados na largura dos ombros. Corpo levemente inclinado para trás.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-indigo-900 mb-2">2. Movimento</h4>
                  <p className="text-sm text-gray-700">Leve a vara para trás suavemente. Acelere para frente com pulso firme.</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-purple-900 mb-2">3. Soltura</h4>
                  <p className="text-sm text-gray-700">Solte a linha no momento certo (45° de elevação). Mire o alvo.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Waves className="w-5 h-5 text-cyan-600" />
                Recolhimento
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-cyan-50 rounded-lg">
                  <p className="font-semibold text-cyan-900 mb-1">🎣 Recolhimento Lento</p>
                  <p className="text-xs text-gray-600">Para peixes calmos. Deixe a isca trabalhar naturalmente.</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-blue-900 mb-1">⚡ Recolhimento Rápido</p>
                  <p className="text-xs text-gray-600">Provoca predadores. Simula peixe fugindo.</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-semibold text-purple-900 mb-1">🔄 Stop and Go</p>
                  <p className="text-xs text-gray-600">Alterna velocidades. Recolhe e para. Muito efetivo!</p>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <p className="font-semibold text-pink-900 mb-1">💫 Twitching</p>
                  <p className="text-xs text-gray-600">Pequenos toques na ponta da vara. Isca vibra.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Fish className="w-5 h-5 text-green-600" />
                Fisgada
              </h3>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-300">
                <p className="font-semibold text-green-900 mb-3">Momento Crucial!</p>
                <ol className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2"><span className="font-bold text-green-700">1.</span> Sinta a batida do peixe na linha</li>
                  <li className="flex gap-2"><span className="font-bold text-green-700">2.</span> Aguarde 1-2 segundos (não fique ansioso!)</li>
                  <li className="flex gap-2"><span className="font-bold text-green-700">3.</span> Puxe a vara com firmeza para cima</li>
                  <li className="flex gap-2"><span className="font-bold text-green-700">4.</span> Mantenha a linha sempre esticada</li>
                  <li className="flex gap-2"><span className="font-bold text-green-700">5.</span> Recolha com calma e constância</li>
                </ol>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Paciência é Fundamental
              </h3>
              <div className="space-y-3">
                <div className="bg-orange-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-700 mb-2">🧘 <strong>Mantenha a calma:</strong> Pesca é sobre esperar o momento certo.</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-700 mb-2">🎯 <strong>Observe o ambiente:</strong> Movimentos na água, pássaros mergulhando.</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-700 mb-2">🔄 <strong>Varie as técnicas:</strong> Se não está funcionando, mude de estratégia.</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-700 mb-2">📚 <strong>Aprenda sempre:</strong> Cada pescaria ensina algo novo.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      */ } {/* {activeTab === 'environment' && (
        <div className="pb-20 max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-green-700 to-teal-700 text-white p-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Leaf className="w-7 h-7" />
              Respeito ao Meio Ambiente
            </h1>
            <p className="text-xs text-green-100 mt-1">Pesca sustentável e consciente</p>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
              <h3 className="font-bold text-xl mb-2">🌍 Preserve para o Futuro</h3>
              <p className="text-sm opacity-90">A pesca sustentável garante que as próximas gerações também possam desfrutar deste esporte.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Não Deixe Lixo
              </h3>
              <div className="space-y-3">
                <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500">
                  <p className="font-semibold text-red-900 mb-2">❌ Nunca Deixe</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Linhas de pesca (podem matar animais)</li>
                    <li>• Embalagens de iscas</li>
                    <li>• Garrafas e latas</li>
                    <li>• Pontas de cigarro</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border-l-4 border-green-500">
                  <p className="font-semibold text-green-900 mb-2">✅ Sempre Faça</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Leve sacolas para lixo</li>
                    <li>• Recolha tudo que trouxe</li>
                    <li>• Deixe o local melhor que encontrou</li>
                    <li>• Recolha lixo de outros se possível</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-blue-600" />
                Tamanhos Mínimos de Captura
              </h3>
              <p className="text-sm text-gray-700 mb-3">Respeite os tamanhos mínimos para permitir reprodução das espécies.</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-semibold text-gray-800">Robalo</span>
                  <span className="text-sm bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-bold">25 cm</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-semibold text-gray-800">Corvina</span>
                  <span className="text-sm bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-bold">30 cm</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-semibold text-gray-800">Dourado</span>
                  <span className="text-sm bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-bold">55 cm</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-semibold text-gray-800">Tucunaré</span>
                  <span className="text-sm bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-bold">25 cm</span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3 italic">* Tamanhos podem variar por região. Consulte legislação local.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Fish className="w-5 h-5 text-cyan-600" />
                Pesque e Solte
              </h3>
              <div className="bg-cyan-50 p-4 rounded-xl">
                <p className="text-sm text-gray-700 mb-3">O <strong>Pesque e Solte</strong> é uma prática sustentável que preserva as espécies.</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-600 font-bold">1.</span>
                    <p className="text-sm text-gray-700">Use anzóis sem farpa ou amasse a farpa</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-600 font-bold">2.</span>
                    <p className="text-sm text-gray-700">Molhe as mãos antes de tocar no peixe</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-600 font-bold">3.</span>
                    <p className="text-sm text-gray-700">Remova o anzol rapidamente e com cuidado</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-600 font-bold">4.</span>
                    <p className="text-sm text-gray-700">Solte o peixe na água com delicadeza</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-600 font-bold">5.</span>
                    <p className="text-sm text-gray-700">Aguarde até ele nadar por conta própria</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" />
                Conheça a Legislação
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-semibold text-purple-900 mb-1">📋 Licença de Pesca</p>
                  <p className="text-xs text-gray-600">Obrigatória em muitas regiões. Verifique as regras locais.</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="font-semibold text-orange-900 mb-1">🚫 Período de Defeso</p>
                  <p className="text-xs text-gray-600">Época de reprodução. Pesca proibida para algumas espécies.</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="font-semibold text-red-900 mb-1">⚠️ Áreas Protegidas</p>
                  <p className="text-xs text-gray-600">Respeite parques e reservas ambientais.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-100 to-green-100 rounded-2xl p-4 border-2 border-teal-400">
              <h4 className="font-bold text-teal-900 mb-2 flex items-center gap-2">
                💚 Seja um Pescador Consciente
              </h4>
              <p className="text-sm text-gray-800">Eduque outros pescadores, denuncie práticas ilegais e seja exemplo de respeito à natureza.</p>
            </div>
          </div>
        </div>
      )}

      {/* Championships Tab */}
      {false && (
        <div className="pb-20 max-w-2xl mx-auto p-4">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-b-3xl shadow-lg">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-7 h-7" />
              Campeonatos Presenciais
            </h1>
            <p className="text-green-100 text-sm mt-1">Inscreva-se em torneios e competições</p>
          </div>

          <div className="space-y-4 mt-4">
            {championships.map((championship) => (
              <div key={championship.id} className="bg-white rounded-xl p-5 shadow-md">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{championship.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{championship.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(championship.date).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    championship.status === 'open' ? 'bg-green-100 text-green-700' :
                    championship.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {championship.status === 'open' ? '🟢 Aberto' : championship.status === 'ongoing' ? '🔵 Em Andamento' : '🔴 Fechado'}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Trophy className="w-5 h-5" />
                    <span className="font-bold">Prêmio: {championship.prize}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-600">
                    <Users className="w-4 h-4 inline mr-1" />
                    <span className="font-semibold">{championship.participants}/{championship.maxParticipants}</span> participantes
                  </div>
                  <div className="w-full max-w-[200px] bg-gray-200 rounded-full h-2 ml-3">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(championship.participants / championship.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>

                {championship.status === 'open' && (
                  <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition-all shadow-md">
                    Inscrever-se Agora
                  </button>
                )}
                {championship.status === 'ongoing' && (
                  <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition-all shadow-md">
                    Ver Resultados ao Vivo
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="pb-20 max-w-2xl mx-auto p-4">
          <div className="bg-gradient-to-r from-pink-600 to-rose-700 text-white p-6 rounded-b-3xl shadow-lg">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Award className="w-7 h-7" />
              Assinatura Premium
            </h1>
            <p className="text-pink-100 text-sm mt-1">Desbloqueie recursos e benefícios exclusivos</p>
          </div>

          <div className="space-y-4 mt-4">
            {subscriptionPlans.map((plan: SubscriptionPlan) => (
              <div 
                key={plan.id} 
                className={`bg-white rounded-xl p-5 shadow-md relative ${
                  plan.popular ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                      ⭐ MAIS POPULAR
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4 mt-2">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold text-pink-600 mb-1">{plan.price}</div>
                </div>

                <div className="space-y-3 mb-5">
                  {plan.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 text-xs">✓</span>
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <button className={`w-full py-3 rounded-xl font-semibold hover:scale-105 transition-all shadow-md ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white'
                    : plan.name === 'Free'
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                }`}>
                  {plan.name === 'Free' ? 'Plano Atual' : 'Assinar Agora'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Zoom Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" 
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300 transition-colors"
            >
              ×
            </button>

            {zoomGalleryPhotos.length > 1 && (
              <>
                <button
                  onClick={() => {
                    if (zoomGalleryPhotos.length === 0) return
                    const idx = selectedZoomIndex >= 0 ? selectedZoomIndex : 0
                    const next = (idx - 1 + zoomGalleryPhotos.length) % zoomGalleryPhotos.length
                    setSelectedPhoto(zoomGalleryPhotos[next])
                  }}
                  className="absolute z-20 pointer-events-auto left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={() => {
                    if (zoomGalleryPhotos.length === 0) return
                    const idx = selectedZoomIndex >= 0 ? selectedZoomIndex : 0
                    const next = (idx + 1) % zoomGalleryPhotos.length
                    setSelectedPhoto(zoomGalleryPhotos[next])
                  }}
                  className="absolute z-20 pointer-events-auto right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
            <div className="relative z-10 bg-black/0 max-h-[90vh] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="relative">
                <img 
                  src={selectedPhoto.url} 
                  alt={`Catch ${selectedPhoto.catchId}`}
                  className="w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
                />

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-2xl">
                  <p className="text-white text-lg font-bold">
                    {new Date(selectedPhoto.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    {typeof selectedPhoto.weight === 'number' ? `${selectedPhoto.weight} kg` : '—'}
                    {selectedPhoto.friendName ? ` • ${selectedPhoto.friendName}` : selectedPhoto.catchId ? ` • Catch #${selectedPhoto.catchId}` : ''}
                  </p>
                </div>
              </div>

              <div className="mt-3 bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl p-3">
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Adicionar legenda..."
                    value={photoCaptions[selectedPhoto.id] ?? selectedPhoto.caption ?? ''}
                    onChange={(e) => {
                      const v = e.target.value
                      setPhotoCaptions((prev) => ({ ...prev, [selectedPhoto.id]: v }))
                    }}
                    className="w-full p-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/50 outline-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleToggleLikePhoto(selectedPhoto.id)}
                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                    aria-label="Curtir"
                  >
                    <Heart className={`w-6 h-6 ${photoLikes[selectedPhoto.id] ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="text-sm font-semibold">Curtir</span>
                  </button>

                  <button
                    onClick={() => setShowPhotoComments((v) => !v)}
                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                    aria-label="Comentar"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-sm font-semibold">Comentar</span>
                  </button>

                  <button
                    onClick={handleShareSelectedPhoto}
                    className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                    aria-label="Compartilhar"
                  >
                    <Share2 className="w-6 h-6" />
                    <span className="text-sm font-semibold">Compartilhar</span>
                  </button>
                </div>

                {showPhotoComments && (
                  <div className="mt-3">
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(photoComments[selectedPhoto.id] || []).map((c, idx) => (
                        <div key={idx} className="text-sm text-gray-800 bg-blue-50 rounded-xl px-3 py-2">
                          {c}
                        </div>
                      ))}
                      {(photoComments[selectedPhoto.id] || []).length === 0 && (
                        <div className="text-sm text-white/60">Sem comentários ainda</div>
                      )}
                    </div>

                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        placeholder="Adicionar um comentário..."
                        value={newPhotoComment}
                        onChange={(e) => setNewPhotoComment(e.target.value)}
                        className="flex-1 p-3 rounded-xl bg-blue-50 border border-blue-100 text-gray-800 placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      <button
                        onClick={() => handleAddPhotoComment(selectedPhoto.id)}
                        className="px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showFishIdentified && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" style={{ padding: '5mm' }}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Peixe identificado</h3>
            <p className="text-sm text-gray-600 mb-4">Encontramos:</p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-blue-800 font-bold text-xl">{identifiedSpecies}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowFishIdentified(false)
                  setIdentifiedSpecies('')
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setNewCatch((prev) => ({ ...prev, species: identifiedSpecies || prev.species }))
                  setShowFishIdentified(false)
                  setShowAddCatch(true)
                }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Usar e preencher dados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Scanner Modal */}
      {showAIScanner && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowAIScanner(false)}>
          <div className="bg-white rounded-3xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Scan className="w-6 h-6 text-purple-600" />
                AI Fish Scanner
              </h2>
              <button
                onClick={() => setShowAIScanner(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <div className="relative bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl p-8 border-2 border-dashed border-purple-300 hover:border-purple-500 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setTimeout(() => {
                        alert('AI Identified: Bass (Largemouth)\nConfidence: 94%\nWeight estimate: 2.3 kg\nLength estimate: 45 cm');
                        setShowAIScanner(false);
                      }, 1500);
                    }
                  }}
                />
                <div className="text-center">
                  <Camera className="w-16 h-16 text-purple-600 mx-auto mb-3" />
                  <p className="text-gray-700 font-semibold mb-1">Take or Upload Photo</p>
                  <p className="text-sm text-gray-500">AI will identify the fish species</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-4">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span>🤖</span>
                How it works
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Take a clear photo of the fish</li>
                <li>• AI analyzes species, size, and weight</li>
                <li>• Auto-fills catch registration form</li>
                <li>• 95%+ accuracy on common species</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAIScanner(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Open Camera
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ padding: '5mm' }}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Nova Captura</h2>
              <button
                onClick={() => setShowAddCatch(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3 text-sm">
                Registro somente em tempo real: foto + GPS no momento da captura.
              </div>
              {registerError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                  {registerError}
                </div>
              )}

              {newCatch.photoUrl && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                  <img src={newCatch.photoUrl} alt="Foto da captura" className="w-full h-48 object-cover" />
                </div>
              )}

              <button
                onClick={() => {
                  setShowAddCatch(false)
                  setShowAIScanner(true)
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <Scan className="w-5 h-5" />
                IA Scan - Identificar Peixe
              </button>

              <select
                value={newCatch.species === '' || fishSpecies.includes(newCatch.species) ? newCatch.species : 'Outro'}
                onChange={(e) => {
                  if (e.target.value === 'Outro') {
                    setNewCatch({ ...newCatch, species: '' })
                  } else {
                    setNewCatch({ ...newCatch, species: e.target.value })
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
              >
                <option value="">Espécie do peixe</option>
                <option value="Tilápia">Tilápia</option>
                <option value="Traíra">Traíra</option>
                <option value="Lambari">Lambari</option>
                <option value="Tucunaré">Tucunaré</option>
                <option value="Corvina">Corvina</option>
                <option value="Robalo">Robalo</option>
                <option value="Pacu">Pacu</option>
                <option value="Pintado">Pintado</option>
                <option value="Dourado">Dourado</option>
                <option value="Bagre">Bagre</option>
                <option value="Carpa">Carpa</option>
                <option value="Piracanjuba">Piracanjuba</option>
                <option value="Curimbatá">Curimbatá</option>
                <option value="Mandi">Mandi</option>
                <option value="Cascudo">Cascudo</option>
                <option value="Outro">✏️ Outro (digitar)</option>
              </select>
              
              {(newCatch.species === '' || !fishSpecies.includes(newCatch.species)) && newCatch.species !== '' && (
                <input
                  type="text"
                  placeholder="Digite a espécie do peixe"
                  value={newCatch.species}
                  onChange={(e) => setNewCatch({ ...newCatch, species: e.target.value })}
                  className="w-full p-3 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-blue-50"
                  autoFocus
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Peso (kg)"
                  value={newCatch.weight}
                  onChange={(e) => setNewCatch({ ...newCatch, weight: e.target.value })}
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <input
                  type="number"
                  placeholder="Tamanho (cm) (opcional)"
                  value={newCatch.length}
                  onChange={(e) => setNewCatch({ ...newCatch, length: e.target.value })}
                  min="0"
                  step="1"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <input
                type="text"
                placeholder={locationLoading ? 'Obtendo localização…' : 'Local (GPS)'}
                value={newCatch.location}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-xl outline-none bg-gray-50 text-gray-700"
              />
              <button
                onClick={() => {
                  void ensureAutoLocation()
                }}
                disabled={locationLoading}
                className={`w-full py-2.5 rounded-xl font-semibold transition-colors active:scale-95 ${
                  locationLoading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {locationLoading ? 'Atualizando GPS…' : 'Atualizar GPS'}
              </button>
              <input
                type="text"
                placeholder="Isca usada (opcional)"
                value={newCatch.baitUsed}
                onChange={(e) => setNewCatch({ ...newCatch, baitUsed: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleAddCatch}
                disabled={registerLoading}
                className={`w-full py-3 rounded-xl font-semibold transition-colors active:scale-95 ${
                  registerLoading ? 'bg-blue-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {registerLoading ? 'Registrando…' : 'Adicionar Captura'}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 border-t"
        style={{
          background: "hsl(210 25% 12% / 0.9)",
          backdropFilter: "blur(20px)",
          borderColor: "hsl(210 20% 20%)"
        }}
      >
        <div className="flex items-center justify-around px-1 py-2 max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab('home')}
            className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-colors"
            style={{ 
              color: activeTab === 'home' ? 'hsl(195 80% 45%)' : 'hsl(210 15% 55%)'
            }}
          >
            <Anchor className={`w-5 h-5 ${activeTab === 'home' ? 'drop-shadow-[0_0_6px_hsl(195_80%_45%/0.5)]' : ''}`} />
            <span className="text-[9px] font-medium">Início</span>
          </button>
          <button
            onClick={() => setActiveTab('leagues')}
            className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-colors"
            style={{ 
              color: activeTab === 'leagues' ? 'hsl(195 80% 45%)' : 'hsl(210 15% 55%)'
            }}
          >
            <Trophy className={`w-5 h-5 ${activeTab === 'leagues' ? 'drop-shadow-[0_0_6px_hsl(195_80%_45%/0.5)]' : ''}`} />
            <span className="text-[9px] font-medium">Liga</span>
          </button>
          <button
            onClick={() => setActiveTab('spots')}
            className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-colors"
            style={{ 
              color: activeTab === 'spots' ? 'hsl(195 80% 45%)' : 'hsl(210 15% 55%)'
            }}
          >
            <MapPin className={`w-5 h-5 ${activeTab === 'spots' ? 'drop-shadow-[0_0_6px_hsl(195_80%_45%/0.5)]' : ''}`} />
            <span className="text-[9px] font-medium">Lugares</span>
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl transition-colors"
            style={{
              color: activeTab === 'community' ? 'hsl(195 80% 45%)' : 'hsl(210 15% 55%)'
            }}
          >
            <Users className={`w-5 h-5 ${activeTab === 'community' ? 'drop-shadow-[0_0_6px_hsl(195_80%_45%/0.5)]' : ''}`} />
            <span className="text-[9px] font-medium">Amigos</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default App
