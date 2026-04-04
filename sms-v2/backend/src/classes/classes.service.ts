import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class, ClassDocument } from './schemas/class.schema';

@Injectable()
export class ClassesService {
  constructor(@InjectModel(Class.name) private classModel: Model<ClassDocument>) {}

  async create(createClassDto: any): Promise<ClassDocument> {
    const createdClass = new this.classModel(createClassDto);
    return createdClass.save();
  }

  async findAll(): Promise<ClassDocument[]> {
    return this.classModel.find().populate('teacher').exec();
  }

  async findOne(id: string): Promise<ClassDocument> {
    const cls = await this.classModel.findById(id).populate('teacher').exec();
    if (!cls) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return cls;
  }

  async update(id: string, updateClassDto: any): Promise<ClassDocument> {
    const cls = await this.classModel
      .findByIdAndUpdate(id, updateClassDto, { new: true })
      .exec();
    if (!cls) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return cls;
  }

  async remove(id: string): Promise<any> {
    const result = await this.classModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return { message: 'Class deleted successfully' };
  }
}
