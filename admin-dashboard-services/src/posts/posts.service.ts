import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>) {
  }

  async create(createPostDto: CreatePostDto) {
    const post = this.postsRepository.create(createPostDto);
    const savedPost = await this.postsRepository.save(post);
    console.log(savedPost);  // Log the saved post to check if it's actually created
    return savedPost;
  }
  

  async findAll() {
    return await this.postsRepository.find();
  }

  async findOne(id: number) {
    return await this.postsRepository.findOne({ where: { id } });
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const post = await this.findOne(id);
    if (!post) {
      throw new NotFoundException();
    }

    Object.assign(post, updatePostDto);

    return await this.postsRepository.save(post);
  }

  async remove(id: number) {
    const post = await this.findOne(id);
    if (!post) {
      throw new NotFoundException();
    }

    return await this.postsRepository.remove(post);
  }
}
