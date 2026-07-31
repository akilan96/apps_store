require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
app.use(cors())
app.use(express.json())

const catalogue = [
  { id: 'arc', title: 'Arc', maker: 'The Browser Company', category: 'Productivity', color: '#ff785b', icon: '◉', rating: 4.9, reviews: '12.4k', size: '214 MB', description: 'A calmer, smarter browser for the way you work.' },
  { id: 'figma', title: 'Figma', maker: 'Figma, Inc.', category: 'Design', color: '#c67cff', icon: '✦', rating: 4.9, reviews: '38.2k', size: '178 MB', description: 'The collaborative interface design tool.' },
  { id: 'notion', title: 'Notion', maker: 'Notion Labs', category: 'Productivity', color: '#efefef', icon: 'N', rating: 4.8, reviews: '28.7k', size: '145 MB', description: 'One workspace. Every team.' },
  { id: 'discord', title: 'Discord', maker: 'Discord Inc.', category: 'Social', color: '#6876f8', icon: '☻', rating: 4.7, reviews: '54.1k', size: '96 MB', description: 'Hang out, play, and talk with friends.' },
  { id: 'obs', title: 'OBS Studio', maker: 'OBS Project', category: 'Creator tools', color: '#252735', icon: '◈', rating: 4.8, reviews: '44.8k', size: '120 MB', description: 'Free and open source software for video recording.' },
  { id: 'spotify', title: 'Spotify', maker: 'Spotify AB', category: 'Music', color: '#1ed760', icon: '●', rating: 4.6, reviews: '71.3k', size: '112 MB', description: 'Music for every moment.' }
]

app.get('/api/apps', (req, res) => res.json(catalogue))
app.get('/api/apps/:id', (req, res) => {
  const appItem = catalogue.find(item => item.id === req.params.id)
  appItem ? res.json(appItem) : res.status(404).json({ message: 'App not found' })
})

const port = process.env.PORT || 5000
if (process.env.MONGODB_URI) mongoose.connect(process.env.MONGODB_URI).then(() => console.log('MongoDB connected')).catch(() => console.log('MongoDB unavailable — using demo catalogue'))
app.listen(port, () => console.log(`Orbital API running on ${port}`))
