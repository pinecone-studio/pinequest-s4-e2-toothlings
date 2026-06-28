export type Specialist = {
  id: string
  name: string
  clinic: string
  district: string
  exp: string
  rating: number
}

export const SPECIALISTS: Specialist[] = [
  { id: '1', name: 'Б. Батболд', clinic: 'Smile Dental', district: 'БЗД', exp: '12 жил', rating: 4.9 },
  { id: '2', name: 'О. Оюунаа', clinic: 'Kids Teeth UB', district: 'СБД', exp: '8 жил', rating: 4.8 },
  { id: '3', name: 'Ц. Цэрэн', clinic: 'Family Dental', district: 'ХУД', exp: '15 жил', rating: 4.7 },
]

export const getSpecialist = (id: string | null | undefined): Specialist | undefined =>
  SPECIALISTS.find((d) => d.id === id)
