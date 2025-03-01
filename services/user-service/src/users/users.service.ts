import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Create a new user
  async create(createUserDto: CreateUserDto) {
    const user = new this.userModel(createUserDto);
    return await user.save();
  }

  // Get all users
  async findAll() {
    const users = await this.userModel.find().exec();
    return users;
  }

  // Get a user by ID
  async findOne(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Get a user by FirebaseId
  async findByFirebaseId(firebaseId: string) {
    console.log(`Searching for user with firebaseId: ${firebaseId}`); // Debug statement
    const user = await this.userModel.findOne({ firebaseId }).exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Update a user
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  //update fcm_token based on FirebaseId
  async updateFcmToken(firebaseId: string, fcm_token: string) {
    const user = await this.userModel.findOne({ firebaseId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.fcm_token = fcm_token;
    await user.save();
    return { message: 'FCM token updated successfully' };
  }

  // Remove a user
  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) throw new NotFoundException('User not found');
    return { message: 'User removed successfully' };
  }
}
