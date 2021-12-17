const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }
  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  let blogWithMostLikes = blogs[0]
  blogs.map(x => x.likes > blogWithMostLikes.likes ? blogWithMostLikes = x : 0)
  const result = {
    'title': blogWithMostLikes.title,
    'author': blogWithMostLikes.author,
    'likes': blogWithMostLikes.likes
  }
  return result
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}