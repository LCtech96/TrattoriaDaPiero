export interface VipItem {
  id?: number
  imageUrl: string
  title: string | null
}

export const staticVips: VipItem[] = [
  { id: 1, imageUrl: '/calcio.png', title: 'Pippo Inzaghi, Carlo Osti e tutto lo staff tecnico' },
  { id: 2, imageUrl: '/Izzo.png', title: 'La Izzo' },
  { id: 3, imageUrl: '/baldini.png', title: 'Silvio Baldini – CT della Nazionale Under 21' },
  { id: 4, imageUrl: '/joe.png', title: 'Il grande Joe' },
  { id: 5, imageUrl: '/monte.png', title: 'Luca Cordero di Montezemolo – ex presidente Ferrari' },
  { id: 6, imageUrl: '/bbc.png', title: 'Intervista della BBC alla Trattoria Da Piero' },
  { id: 7, imageUrl: '/nico.png', title: 'Nicolo Ventola e Chiara Giuffrida' },
  { id: 8, imageUrl: '/Al-tahni.png', title: 'Nipote di Al-Tahni' },
  { id: 9, imageUrl: '/tognazzi.png', title: 'Tognazzi' },
  { id: 10, imageUrl: '/Ilicic.png', title: 'Josip Iličić' },
  { id: 11, imageUrl: '/Fac.png', title: 'Francesco Facchinetti e Giorgio Perimetri' },
  { id: 12, imageUrl: '/fab.png', title: 'Fabrizio Miccoli' },
]
