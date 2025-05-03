import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getBlogs = async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany();
    return res.json(blogs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body; 
    const newBlog = await prisma.blog.create({
      data: { title, content },
    });

    return res.status(201).json(newBlog);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create blog' });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await prisma.blog.findUnique({
      where: { id: Number(id) },
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    return res.json(blog);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch blog' });
  }
};