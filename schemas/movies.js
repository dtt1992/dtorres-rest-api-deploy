const z = require('zod')

// Validaciones de insercion a la base de datos
const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'El titulo de la pelicula tiene que ser un texto.',
    required_error: 'El titulo de la pelicula es requerido.'
  }),
  year: z.number().int().min(1900).max(2025),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(0),
  poster: z.string().url({
    message: 'Poster tiene que ser una url'
  }),
  genre: z.array(
    z.enum(
      [
        'Action',
        'Adventure',
        'Comedy',
        'Drama',
        'Fantasy',
        'Horror',
        'Thriller',
        'Sci-Fi',
        'Crime'
      ],
      {
        required_error: 'El genero de la pelicula es requerido',
        invalid_type_error:
          'El genero de la pelicula tiene que estar dentro de la array de genero'
      }
    )
  )
})

function validateMovie (object) {
  return movieSchema.safeParse(object)
}

function validatePartialMovie (input) {
  return movieSchema.partial().safeParse(input)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
