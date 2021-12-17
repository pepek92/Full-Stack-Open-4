/* eslint-disable indent */
/* eslint-disable no-undef */
/* eslint-disable quotes */
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    userId: "5daf3285da626112edf21acd"
  },
  {
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    userId: "5daf3285da626112edf21acd"
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})

  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()

  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()

  await User.deleteMany({})
})

describe('database GET', () => {
  test('return right amount of blogs', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(2)
  })
  test('return right amount of blogs when added one blog', async () => {
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(3)
  })
  test('notes are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  test('blog has id', async () => {
    const response = await api.get('/api/blogs')
    response.body.map(blog => expect(blog.id).toBeDefined())
  })
})

describe('database POST', () => {
  test('adding new blog works', async () => {
    console.log(initialBlogs[0])
    await api
      .post('/api/blogs/')
      .send(initialBlogs[0])
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(initialBlogs.length + 1)
  })
  test('set likes to 0 if missing', async () => {

    const blog = {
      title: "Blog that no one likes",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      userId: "5daf3285da626112edf21acd"
    }

    const newBlog = new Blog(blog)
    const savedBlog = await newBlog.save()
    expect(savedBlog.likes).toBe(0)
  })
  test('missing title', async () => {

    const blog = {
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 2,
        userId: "5daf3285da626112edf21acd"
      }
    await api
      .post('/api/blogs')
      .send(blog)
      .expect(400)
  })
  test('missing url', async () => {

    const blog = {
        author: "Robert C. Martin",
        title: "Type wars",
        likes: 2,
        userId: "5daf3285da626112edf21acd"
      }

    await api
      .post('/api/blogs')
      .send(blog)
      .expect(400)
  })
})
describe('database DELETE', () => {
  test('delete by id returns 204', async () => {
    await api
      .delete('/api/blogs/61bc554850bdda3624bf9cae')
      .expect(204)
  })
})
afterAll(() => {
  mongoose.connection.close()
})