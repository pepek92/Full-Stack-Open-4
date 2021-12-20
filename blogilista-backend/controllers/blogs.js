const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => { 
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs.map(blog => blog.toJSON()))
})
  
blogsRouter.post('/', async (request, response) => {
  const body = request.body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  let blog = new Blog({
    'title': body.title,
    'author': body.author,
    'url': body.url,
    'likes': body.likes,
    'user': user._id
  })

  if (!blog.title || !blog.url) {
    return response.status(400).json({ error: 'title or url missing' }).end()
  }
  
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.json(savedBlog.toJSON())
})

blogsRouter.delete('/:id', async (req, res) => {
  const id = req.params.id

  const blog = await Blog.findById(id)
  const token = req.token

  if (!blog) {
    return res.status(400).json({ error: 'blog not found' })
  }
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if (!decodedToken.id || blog.user.toString() !== decodedToken.id) {
    return res.status(401).json({ error: 'token invalid or missing' })
  } else {
    const deletedBlog = await Blog.findByIdAndRemove(id)
    res.json(deletedBlog.toJSON())
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  await Blog.findByIdAndUpdate(request.params.id, blog, { new: true})
  response.status(200).end()
})

module.exports = blogsRouter