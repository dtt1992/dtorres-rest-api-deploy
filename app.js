const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies.js')

const app = express()
app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:57666',
      'http://localhost:1234',
      'http://movies.com',
      'http://midu.dev'
    ]
    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }
    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('No permitido por CORS'))
  }
}))
app.disable('x-powered-by') // Desahabilitar el header x-powered-by: Express

// Con el CORS tenemos metodos normales: GET/HEAD/POST
// Con el CORS tenemos metodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight cuando son metodos complejos

// Todos los recursos que sean MOVIES se identifican con /movies

app.get('/movies', (req, res) => {
  // Cuando la peticion es del mismo ORIGIN, no esta el origin en el header
  // http://localhost:1234 -> http://localhost:1234
  // const origin = req.header('origin')
  // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
  //   // Dar permisos para poder consultar el json desde el origen
  //   res.header('Access-Control-Allow-Origin', origin)
  // }
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some(
        (g) => g.toLocaleLowerCase() === genre.toLocaleLowerCase()
      )
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => {
  // path-tp-regexp
  const { id } = req.params
  const movie = movies.find((movie) => movie.id === id)
  if (movie) return res.json(movie)

  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  // console.log(result)
  if (result.error) {
    // 422
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  // Base de datos
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }
  // console.log(newMovie)

  // // Esto no seria REST, porque estamos guardando el estado de la aplicacion en memoria
  movies.push(newMovie)
  // console.log(movies)

  // // // Estado de creacion 201
  res.status(201).json(newMovie) // Actualizar la cache del cliente
})

app.delete('/movies/:id', (req, res) => {
  // const origin = req.header('origin')
  // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
  //   // Dar permisos para poder consultar el json desde el origen
  //   res.header('Access-Control-Allow-Origin', origin)
  // }
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Pelicula no encontrada' })
  }

  movies.splice(movieIndex, 1)
  return res.json({ message: 'Pelicula borrada' })
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  // console.log(validatePartialMovie(res.body))
  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  const { id } = req.params
  console.log({ id })
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Pelicula no encontrada' })
  }
  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }
  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

app.options('/movies/:id', (req, res) => {
  // const origin = req.header('origin')
  // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
  //   // Dar permisos para poder consultar el json desde el origen
  //   res.header('Access-Control-Allow-Origin', origin)
  //   res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
  // }
  res.send(200)
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
  console.log('El servidor esta en http://localhost:1234')
})
