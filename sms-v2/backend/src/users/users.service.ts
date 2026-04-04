import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userDto: any): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    const createdUser = new this.userModel({
      ...userDto,
      password: hashedPassword,
    });
    return createdUser.save();
  }

  async findOneByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findOneById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findTeachers(): Promise<UserDocument[]> {
    return this.userModel.find({ role: 'TEACHER' }).select('-password').exec();
  }

  async update(id: string, updateUserDto: any): Promise<UserDocument | null> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).select('-password').exec();
  }

  async remove(id: string): Promise<any> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
        throw new Error('User not found');
    }
    return { message: 'Teacher deleted successfully' };
  }
}
